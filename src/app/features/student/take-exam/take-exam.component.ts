import { Component, OnInit } from '@angular/core';
import { SubjectService, Subject } from '../../../services/subject.service';
import { ExamService, RequestedExam } from '../../../services/exam.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-take-exam',
  templateUrl: './take-exam.component.html',
  styleUrl: './take-exam.component.css',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SelectModule,
    ProgressSpinnerModule,
    RadioButtonModule,
    ButtonModule
  ]
})
export class TakeExamComponent implements OnInit {
  subjects: Subject[] = [];
  selectedSubject: Subject | null = null;
  loading = false;
  exam: RequestedExam | null = null;
  error: string | null = null;

  timer: number = 0; // seconds remaining
  timerInterval: any = null;

  constructor(private subjectService: SubjectService, private examService: ExamService) {}

  ngOnInit() {
    this.loading = true;
    this.subjectService.getSubjects().subscribe({
      next: res => {
        this.subjects = res.data || [];
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load subjects.';
        this.loading = false;
      }
    });
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  onSubjectSelect(subject: Subject | null) {
    console.log('Selected subject:', subject);
    this.selectedSubject = subject;
    this.exam = null;
    this.error = null;
    if (subject && subject.id) {
      this.fetchExam(subject.id);
    }
  }

  fetchExam(subjectId: number) {
    this.loading = true;
    this.examService.requestExam(subjectId).subscribe({
      next: res => {
        this.exam = res.data;
        if (this.exam && this.exam.questions) {
          this.exam.questions.forEach(q => (q as any).selectedOption = null);
        }
        // Set timer and start countdown
        this.timer = this.exam?.remainingTime || 0;
        this.startTimer();
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to fetch exam.';
        this.loading = false;
      }
    });
  }

  startTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.timerInterval = setInterval(() => {
      if (this.timer > 0) {
        this.timer--;
      } else {
        clearInterval(this.timerInterval);
        // Optionally: auto-submit or show a message
      }
    }, 1000);
  }

  get formattedTimer(): string {
    const m = Math.floor(this.timer / 60).toString().padStart(2, '0');
    const s = (this.timer % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }
}
