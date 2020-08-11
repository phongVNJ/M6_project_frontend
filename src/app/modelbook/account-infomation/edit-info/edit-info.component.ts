import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {IAccount} from '../../../models/iaccount';
import {AccountService} from '../../../service/account.service';
import {ActivatedRoute, Router} from '@angular/router';
import {AngularFireStorage} from '@angular/fire/storage';
import {finalize} from 'rxjs/operators';
import {TokenStorageService} from '../../../service/tokenstorage.service';

@Component({
  selector: 'app-edit-info',
  templateUrl: './edit-info.component.html',
  styleUrls: ['./edit-info.component.css']
})
export class EditInfoComponent implements OnInit {
  editUserProfile: FormGroup;
  userAvatar:FormGroup;
  user: IAccount = {
    email:'',
    password:'',
    avatarUrl: ''
  };
  selectedImage:any = null;

  accountId = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private accountService: AccountService,
    private route: ActivatedRoute,
    private storage: AngularFireStorage,
    private tokenService: TokenStorageService
  ) { }
  // id = +this.route.snapshot.paramMap.get('id');

  ngOnInit(): void {
    this.accountId = this.tokenService.getAccount();
    this.userAvatar = this.fb.group({
      avatar:[''],
    });
    this.editUserProfile = this.fb.group({
      id: [''],
      email: [''],
      name: [''],
      password: [''],
      address: [''],
      phoneNumber: [''],
      dateOfBirth: [''],
      avatarUrl:['']
    });
    this.findUserByID();
  }
  findUserByID(){
    this.accountService.getAccount(this.accountId).subscribe((res : IAccount) =>{
      this.user = res;
      this.editUserProfile.patchValue(res);
    })
  }
  editAccountInfo(){
    let data = this.editUserProfile.value;
    this.accountService.editAccountInfo(data, this.accountId).subscribe((res : IAccount) => {
      this.user = data;
      console.log(this.user);
      // this.router.navigate([''])
    })
  }

  updateAvatar() {
    if(this.selectedImage !==null){
      const filePath = `avatar/${this.selectedImage.name.split('.').slice(0,-1).join('.')}_${new Date().getTime()}`;
      const fileRef = this.storage.ref(filePath);
      this.storage.upload(filePath,this.selectedImage).snapshotChanges().pipe(
        finalize(
          ()=> fileRef.getDownloadURL().subscribe(url=>{
            this.editUserProfile.value.avatarUrl = url;
            alert("Ấn cập nhật để xác nhận thay đổi.")
          })
        )
      ).subscribe();
    }

  }

  loadImgFile(even:any) {
    if(even.target.files && even.target.files[0]){
      const reader = new FileReader();
      reader.onload = (e:any) => this.user.avatarUrl = e.target.result;
      reader.readAsDataURL(even.target.files[0]);
      this.selectedImage = even.target.files[0];
    }else {
      this.selectedImage = null;
    }

  }
}