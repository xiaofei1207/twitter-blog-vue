<template>
  <div class="comment-main">
    <div class="comments-list">
      <div class="item animated slideInRight" v-for="(item,index) in comments" v-bind:key="index">
        <div class="item-heading">
          <div class="left">
            <img :src="item.AvatarUrl" @click="openGithub(item.GithubUrl)" />
            <span class="item-username" @click="openGithub(item.GithubUrl)">{{item.Username}}</span>
          </div>
          <div class="right">
            <div class="date">{{item.CreatedAt.substring(0,10)}}</div>
          </div>
        </div>
        <div class="item-content" v-html="item.Content"></div>
        <div class="item-content-from" v-show="full">
          来源:{{item.ArticleID===120008?'留言墙':''}}
          <span
            v-show="item.ArticleID!==120008"
            @click="pushArticle(item.ArticleID)"
          >{{item.ArticleTitle.length>15?item.ArticleTitle.substring(0,15)+"...":item.ArticleTitle}}</span>
        </div>
      </div>
    </div>
    <div v-if="commentPanelShow">
      <textarea class="comment-input" placeholder="请输入内容" id="textpanel" v-model="content"></textarea>
      <div class="opration">
        <div class="emoji-panel-btn" @click="showEmojiPanel">
          <img src="../../../assets/img/face_logo.png" />
        </div>
        <div class="link-github" @click="login" title="github登录">
          <i class="iconfont">&#xe600;</i>
        </div>
        <blog-button @click="saveComment" type="primary" size="small">留个言儿</blog-button>
        <emoji-panel
          class="animated fadeIn"
          @onClose="closeEmojiPanel"
          @emojiClick="appendEmoji"
          v-if="isShowEmojiPanel"
        ></emoji-panel>
      </div>
    </div>
  </div>
</template>
<script>
import EmojiPanel from "./EmojiPanel.vue";
import Emoji from "./Emoji.vue";
import BlogButton from "@/components/commons/button/BlogButton.vue";
import { apiCommentSave, apiCommentList } from "@/api/comment";
import clickOutside from "@/directives/vueClickOutSize";
export default {
  data() {
    return {
      content: "",
      isShowEmojiPanel: false,
      comments: [],
      commentPanelShow: false
    };
  },
  components: {
    EmojiPanel,
    Emoji,
    BlogButton
  },
  props: {
    full: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    pushArticle(id) {
      this.$router.push(`/article/${id}`);
    },
    openGithub(url) {
      window.open(url);
    },
    closeEmojiPanel() {
      this.isShowEmojiPanel = false;
    },
    async saveComment() {
      if (this.content === "") {
        this.$message.error("评论内容不能为空");
        return;
      }
      if (!sessionStorage.getItem("user")) {
        this.$message.error("登录后才可进行评论");
        return;
      }
      const userInfo = JSON.parse(sessionStorage.getItem("user"));
      try {
        const res = await apiCommentSave(
          {
            Content: this.content,
            ArticleID: this.$route.params.id ? this.$route.params.id : 120008,
            GitUserID: userInfo.id,
            Username: userInfo.login,
            AvatarUrl: userInfo.avatar_url,
            GithubUrl: userInfo.html_url
          },
          null
        );
        const temp = res.Data.comment;
        this.comments.push({
          ...temp,
          Content: temp.Content.replace(/:.*?:/g, this.emoji)
        });
        this.getCommentList();
        this.content = "";
        this.isShowEmojiPanel = false;
      } catch (e) {
        this.$message.error(e.Msg);
      }
    },
    async getCommentList() {
      try {
        const res = await apiCommentList(
          {
            ArticleID: this.full
              ? null
              : this.$route.params.id
              ? this.$route.params.id
              : 120008
          },
          null
        );
        const newArr = res.Data.List.map(item => {
          item.Content = item.Content.replace(/:.*?:/g, this.emoji);
          return item;
        });
        this.comments = newArr;
        this.commentPanelShow = true;
      } catch (e) {
        this.$message.error(e.Msg);
      }
    },
    showEmojiPanel() {
      this.isShowEmojiPanel = !this.isShowEmojiPanel;
    },
    emoji(word) {
      const type = word.substring(1, word.length - 1);
      return `<span class="emoji-item-common emoji-${type} emoji-size-small" ></span>`;
    },
    appendEmoji(text) {
      const el = document.getElementById("textpanel");
      this.content = el.value + ":" + text + ":";
    },
    login() {
      window.location.href =
        "https://github.com/login/oauth/authorize?client_id=63ef2362d2082fac3874";
    }
  },
  created() {
    this.getCommentList();
  }
};
</script>
<style  lang="scss">
// 注意 这里因为v-html的原因 不能使用scoped 不然样式不能失效
.comment-main {
  width: 522px;
  margin-bottom: 180px;
  .emoji-item-common {
    background: url("../../../assets/img/emoji_sprite.png");
    display: inline-block;
    &:hover {
      cursor: pointer;
    }
  }
  .emoji-size-small {
    // 表情大小
    zoom: 0.3;
    &:hover {
      cursor: default;
    }
  }
  .emoji-size-large {
    zoom: 0.5; // emojipanel表情大小
    margin: 4px;
  }
  .comments-list {
    margin-top: 20px;
    .item {
      margin-bottom: 20px;
      border-bottom: 1px solid #cccccc;
      &:last-child {
        border-bottom: 0;
      }
      .item-heading {
        display: flex;
        justify-content: space-between;
        .left {
          display: inline-block;
          img {
            height: 32px;
            width: 32px;
            border-radius: 50%;
            vertical-align: middle;
            &:hover {
              cursor: pointer;
            }
          }
          .item-username {
            margin-left: 5px;
            font-weight: bold;
            &:hover {
              cursor: pointer;
              opacity: 0.8;
            }
          }
        }
        .right {
          display: inline-block;
        }
      }
      .item-content {
        margin: 10px 0px;
        span {
          vertical-align: top;
        }
      }
      .item-content-from {
        text-align: right;
        color: #c5c5c5;
        span {
          &:hover {
            cursor: pointer;
            color: #888;
          }
        }
      }
    }
  }
  .comment-input {
    height: 100px;
    width: 500px;
    border: 1px solid #cccccc;
    border-radius: 5px;
    padding: 10px;
    resize: none;
    &:focus {
      outline: none;
    }
  }
  .opration {
    width: 522px;
    display: flex;
    justify-content: space-between;
    position: relative;
    .emoji-panel-btn {
      &:hover {
        cursor: pointer;
        opacity: 0.8;
      }
      img {
        height: 24px;
        width: 24px;
      }
    }
    .link-github {
      position: absolute;
      right: 100px;
      top: 5px;
      &:hover {
        cursor: pointer;
        opacity: 0.7;
      }
      color: rgb(70, 185, 128);
    }
  }
}
@import "../../../assets/css/emoji.css"; // 导入精灵图样式
</style>