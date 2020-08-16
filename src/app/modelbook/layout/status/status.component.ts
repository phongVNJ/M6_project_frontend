import {Component, Input, OnInit} from '@angular/core';
import {Istatus} from '../../../models/istatus';
import {AccountService} from '../../../service/account.service';
import {TokenStorageService} from '../../../service/tokenstorage.service';
import {StatusService} from '../../../service/status/status.service';
import {Icomment} from '../../../models/icomment';
import {CommentService} from '../../../service/comment/comment.service';
import {NotificationService} from '../../../service/notification.service';
import {LikesService} from '../../../service/likes/likes.service';
import {INewfeedResponse} from '../../../models/response-observable/inewfeed-response';

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.css']
})
export class StatusComponent implements OnInit {

  statuses: Istatus[];
  current_id: number;

  newFeedResponse: INewfeedResponse[];

  comments: Icomment[];


  new_comment: Icomment = {
    content: '',
    account: {
      id: this.current_id,
    },

  }

  status_id_loading_comments: number;



  constructor(private accountService: AccountService,
              private token: TokenStorageService,
              private statusService: StatusService,
              private commentService: CommentService,
              private notice: NotificationService,
              private likeService: LikesService) {
  }

  ngOnInit(): void {
    this.current_id = this.token.getAccount();
    this.getNewFeed();
  }

  // getStatusList() {
  //   this.accountService.getListStatusByAccount(this.current_id).subscribe(
  //     (statusList) => {
  //       this.statuses = statusList;
  //     });
  // }

  getNewFeed() {
    this.statusService.getNewFeed2(this.current_id).subscribe(
      (newfeed:any) => {
        console.log(newfeed);
        this.newFeedResponse = newfeed;
        this.newFeedResponse.map(
          status1 =>
            status1.status.createDate = new Date(status1.status.createDate));
      }
    );
  }


  deleteStatus(id: number) {
    this.statusService.deleteStatusById(id).subscribe((response) => {
      if (response.message == 'xóa thành công') {
        alert('xóa thành công');
        this.getNewFeed();
      } else {
        alert('xóa không thành công');
      }
    }, () => {
      alert('lỗi kết nối');
    });

  }

  getCommentByStatus(id: number) {
    return this.commentService.getCommentsByStatusId(id).toPromise();
  }

  async loadComments(id: number, index: number, statues: INewfeedResponse[]) {
    const comments = await this.getCommentByStatus(id);
    statues[index].status.comments = comments;
    console.log(comments);
  }

  likeStatus(id: number,index:number) {
    this.likeService.likeStatus(id,this.current_id).subscribe(
      (data)=>{
        if(data.message == 'success'){
          this.notice.success("Like thanh cong")
          this.getNewFeed();
        }else {
          this.notice.fail("like loi")
        }
      },()=>{
        this.notice.fail("loi ket noi")
      }
    )
  }

  unlikeStatus(status_id: number) {
    this.likeService.unlikeStatus(this.current_id,status_id).subscribe(
      (response)=>{
        if(response.message == 'success'){
          this.notice.success("Unlike thành công");
          this.getNewFeed();
        }else {
          this.notice.fail("Unlike thất bại")
        }

      },()=>{
        this.notice.fail("lỗi kết nối");
      }
    )

  }

  addComment(status_id:number,index:number) {
    // @ts-ignore
    const text_value = document.getElementById("newComment"+status_id).value;
    this.new_comment.content = text_value;
    this.new_comment.account.id = this.current_id;
    this.commentService.createComment(this.new_comment,status_id).subscribe(
      (response)=>{
        if(response.message == 'success'){
          this.notice.success("Comment thành công");
          this.loadComments(status_id,index,this.newFeedResponse);
        }else {
          this.notice.fail("Không thành công, xin thử lại");
        }
      },()=>{
        this.notice.fail("Lỗi kết nối");
      }
    )

  }


}
