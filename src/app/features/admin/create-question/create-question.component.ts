import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { SubjectService, Subject } from '../../../services/subject.service';
import { QuestionService } from '../../../services/question.service';
import { CreateQuestionRequest, QuestionOption } from '../../../shared/question.interfaces';

@Component({
  selector: 'app-create-question',
  templateUrl: './create-question.component.html',
  styleUrls: ['./create-question.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, Select, InputText, Textarea, ButtonModule]
})
export class CreateQuestionComponent implements OnInit {
  form: FormGroup;
  subjects: Subject[] = [];
  answerOptions = [
    { label: 'Option A', value: 'A' },
    { label: 'Option B', value: 'B' },
    { label: 'Option C', value: 'C' },
    { label: 'Option D', value: 'D' }
  ];
  difficultyOptions = [
    { label: 'Easy', value: 'Easy' },
    { label: 'Medium', value: 'Medium' },
    { label: 'Hard', value: 'Hard' }
  ];
  successMessage: string | null = null;
  errorMessage: string | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private subjectService: SubjectService,
    private questionService: QuestionService
  ) {
    this.form = this.fb.group({
      subject: [null, Validators.required],
      question: ['', Validators.required],
      optionA: ['', Validators.required],
      optionB: ['', Validators.required],
      optionC: ['', Validators.required],
      optionD: ['', Validators.required],
      correctAnswer: [null, Validators.required],
      difficulty: [null, Validators.required]
    });
  }

  ngOnInit() {
    this.subjectService.getSubjects().subscribe({
      next: (res) => {
        this.subjects = res.data;
      },
      error: (err) => {
      }
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.isLoading = true;
      this.successMessage = null;
      this.errorMessage = null;
      const formValue = this.form.value;
      const options: QuestionOption[] = [
        { text: formValue.optionA, isCorrect: formValue.correctAnswer === 'A' },
        { text: formValue.optionB, isCorrect: formValue.correctAnswer === 'B' },
        { text: formValue.optionC, isCorrect: formValue.correctAnswer === 'C' },
        { text: formValue.optionD, isCorrect: formValue.correctAnswer === 'D' }
      ];
      const request: CreateQuestionRequest = {
        subjectId: formValue.subject,
        text: formValue.question,
        difficulty: formValue.difficulty,
        options
      };
      this.questionService.createQuestion(request).subscribe({
        next: (res) => {
          this.isLoading = false;
          this.successMessage = res.message;
          this.form.reset();
        },
        error: (err) => {
          console.log(err);
          this.isLoading = false;
          this.errorMessage = err?.error?.errors || 'Failed to create question.';
        }
      });
    }
  }
}
