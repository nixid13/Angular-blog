import {Component, OnDestroy, OnInit} from '@angular/core';
import {PostService} from '../../shared/post.service';
import {Post} from '../../shared/interfaces';
import {Subscription} from 'rxjs';
import {AlertService} from '../shared/services/alert.service';

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss']
})
export class DashboardPageComponent implements OnInit, OnDestroy {

  posts: Post[] = [];
  postsSub: Subscription;
  deleteSub: Subscription;
  searchStr = '';

  constructor(private postsService: PostService, private alertService: AlertService) {
  }

  ngOnInit() {
    this.postsSub = this.postsService.getAll()
      .subscribe(posts => {
        this.posts = posts;
      });
  }

  removePost(id: string) {
    this.deleteSub = this.postsService.removePost(id)
      .subscribe(() => {
        this.posts = this.posts.filter(post => post.id !== id);
        this.alertService.danger('Post was removed');
      });
  }

  ngOnDestroy(): void {
    if (this.postsSub) {
      this.postsSub.unsubscribe();
    }
    if (this.deleteSub) {
      this.deleteSub.unsubscribe();
    }
  }
}
