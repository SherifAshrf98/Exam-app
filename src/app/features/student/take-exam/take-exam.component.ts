import { Component, OnInit, OnDestroy } from '@angular/core';
import { SubjectService, Subject } from '../../../services/subject.service';
import { ExamService, RequestedExam, ExamAnswer } from '../../../services/exam.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

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
    ButtonModule,
    ToastModule
  ],
  providers: [MessageService]
})
export class TakeExamComponent implements OnInit, OnDestroy {
  subjects: Subject[] = [];
  selectedSubject: Subject | null = null;
  loading = false;
  submitting = false;
  exam: RequestedExam | null = null;
  error: string | null = null;

  timer: number = 0;
  timerInterval: any = null;

  constructor(
    private subjectService: SubjectService, 
    private examService: ExamService,
    private messageService: MessageService
  ) {}

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
        this.autoSubmitExam();
      }
    }, 1000);
  }

  get formattedTimer(): string {
    const m = Math.floor(this.timer / 60).toString().padStart(2, '0');
    const s = (this.timer % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  prepareAnswers(): ExamAnswer[] {
    if (!this.exam || !this.exam.questions) {
      return [];
    }

    return this.exam.questions
      .filter(q => q.selectedOption !== null && q.selectedOption !== undefined)
      .map(q => ({
        questionId: q.questionId,
        selectedOptionId: q.selectedOption!
      }));
  }

  submitExam() {
    if (!this.exam) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No exam to submit.'
      });
      return;
    }

    const answers = this.prepareAnswers();
    if (answers.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please answer at least one question before submitting.'
      });
      return;
    }

    this.submitting = true;
    this.examService.submitExam(this.exam.id, answers).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Exam submitted successfully!'
        });
        
        // Clear the exam and reset
        this.exam = null;
        this.selectedSubject = null;
        this.submitting = false;
        
        // Optionally redirect to exam history
        setTimeout(() => {
          // You can add navigation here if needed
        }, 2000);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to submit exam. Please try again.'
        });
        this.submitting = false;
      }
    });
  }

  autoSubmitExam() {
    if (this.exam) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Time Up',
        detail: 'Time is up! Submitting your exam automatically.'
      });
      this.submitExam();
    }
  }

  cancelExam() {
    this.exam = null;
    this.selectedSubject = null;
    this.error = null;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }
}
