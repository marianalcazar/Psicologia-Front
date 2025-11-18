import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreeAvatar } from './three-avatar';

describe('ThreeAvatar', () => {
  let component: ThreeAvatar;
  let fixture: ComponentFixture<ThreeAvatar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreeAvatar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThreeAvatar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
