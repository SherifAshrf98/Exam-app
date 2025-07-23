import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import {
  SubjectService,
  Subject,
  ExamConfig,
} from '../../../services/subject.service';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-exam-configurations',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    CardModule,
    InputNumberModule,
    ButtonModule,
    SelectModule,
    ToastModule,
    ProgressSpinnerModule,
    Select,
  ],
  providers: [MessageService],
  templateUrl: './exam-configurations.component.html',
  styleUrl: './exam-configurations.component.css',
})
export class ExamConfigurationsComponent implements OnInit {
  subjects: Subject[] = [];
  selectedSubject: Subject | null = null;
  configExists = false;
  loading = false;
  form: FormGroup;

  constructor(
    private subjectService: SubjectService,
    private fb: FormBuilder,
    private messageService: MessageService
  ) {
    this.form = this.fb.group({
      numEasy: [0, [Validators.required, Validators.min(0)]],
      numMedium: [0, [Validators.required, Validators.min(0)]],
      numHard: [0, [Validators.required, Validators.min(0)]],
      duration: [0, [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit() {
    this.subjectService.getSubjects().subscribe((res) => {
      this.subjects = Array.isArray(res.data) ? res.data.filter(Boolean) : [];
    });
  }

  onSubjectSelect(subject: Subject | null) {
    this.selectedSubject = subject;
    if (!subject) {
      this.form.reset({ numEasy: 0, numMedium: 0, numHard: 0, duration: 0 });
      this.configExists = false;
      return;
    }

    this.loading = true;
    this.subjectService.getExamConfig(subject.id).subscribe({
      next: (config) => {
        this.form.patchValue(config);
        this.configExists = true;
        this.loading = false;
      },
      error: () => {
        this.form.reset({ numEasy: 0, numMedium: 0, numHard: 0, duration: 0 });
        this.configExists = false;
        this.loading = false;
      },
    });
  }

  saveConfig() {
    if (!this.selectedSubject) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const totalQuestions =
      this.form.value.numEasy +
      this.form.value.numMedium +
      this.form.value.numHard;
    if (totalQuestions !== 10) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'The total number of questions must be exactly 10.',
      });
      return;
    }
    this.loading = true;
    const onSuccess = () => {
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Exam configuration saved successfully!',
      });
      this.selectedSubject = null;
      this.form.reset({ numEasy: 0, numMedium: 0, numHard: 0, duration: 0 });
      this.loading = false;
    };
    if (this.configExists) {
      this.subjectService
        .updateExamConfig(this.selectedSubject.id, this.form.value)
        .subscribe({
          next: () => {
            onSuccess();
            this.loading = false;
          },
          error: () => (this.loading = false),
        });
    } else {
      this.subjectService
        .createExamConfig(this.selectedSubject.id, this.form.value)
        .subscribe({
          next: () => {
            onSuccess();
            this.loading = false;
          },
          error: () => (this.loading = false),
        });
    }
  }

  cancelConfig() {
    this.selectedSubject = null;
    this.form.reset({ numEasy: 0, numMedium: 0, numHard: 0, duration: 0 });
  }
}
