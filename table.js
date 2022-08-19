/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
'use strict';

let isflag; //retrieve history messages when window is minimized and reopened within timeout
const languageMessageMap = {
    "en": {
        language: "english",
        wrapperMessage: "Hi! I am Merva! <br/>Click for assistance.",
        greetingMessage: "Hi",
        placeholder: "Ask something...",
        languageChangeText: "Do you want to switch to English? <div>All your previous responses will be deleted.",
        languageChangeConfirmBtn: "Change language.",
        refreshChatText: "Do you want to refresh the session? <div>The previous conversation will be deleted.",
        sessionEndText: "Your session has timed out. <div>The previous conversation will be deleted.",
        refreshChatConfirmBtn: "Refresh session",
        languageChangeSelectText: "Please select your preferred language from the list below.",
        botLogoAltText: "ICICI logo",
        minimizeIconAltText: "Minimize",
        refreshIconAltText: "Refresh session",
        webhookApiFailedText: "Something went wrong, Please try again!",
        webhookApiFailedBtn: "Ok"

    },
};
// let sessionId = Math.random().toString(36).substring(7);
let sessionId;

const storageUrl = '../assets/';
let time;
 // suggestion Chips flag  
let suggestionChipsFlag = false;
 // disable input Text Field flag  
let disableTextFieldFlag = false;

let idleTime;
let sessionExpiryTime = 1200000;
let sessionExpiryCount = 0;
class ShadowDemo extends HTMLElement {
    constructor() {
        super();
        //code to show floating chat-widget on the page
        this.shadow = this.attachShadow({ mode: "open" });
        // this.newShadow = this.attachShadow({mode:"open"});
        this.userName = 'abc';
        this.password = 'root';
        this.timeout = null;
        this.agentName = 'treasury'
        this.addressInputThreshold = 4;
        this.chatHistory = '';
        //Initialize base url of Integration Service
        this.baseURL = shadow.getAttribute('url')
        this.storageUrl = storageUrl;
        this.languageMessageMap = languageMessageMap;
        this._buildChatBox();
    }

    _buildChatBox() {
        this._createWrapper();
        this._createChatWindow();
        const style = document.createElement('style');
        style.textContent = `
        :root {
            --chat-title-color: #053C6D;
            --user-message-bg: #D1CFBB;
            --user-message-font-color: #000000;
            --bot-message-bg: #D1CFBB;
            --bot-message-font-color: #000000
        }

        /* Auto complete css starts */
        .autocomplete {
            text-align: left;
            background-color: white;
            position: --webkit-sticky;
            position:fixed;
            z-index=-1;
            max-height: 250px;
            overflow-y: scroll;
            scroll-behavior:smooth;
            width: 100%;
            border: 1px solid rgb(173 170 173 / 41%);
            box-sizing: border-box;
            box-shadow: rgb(0 0 0 / 24%) 1px 4px 15px 0px;
            border-top-right-radius: 5px;
            border-top-left-radius: 5px;
            // transform: translateY(0%)
            // transition: transform 0.2s ease, opacity 0.2s ease-in, height 0s ease 0.2s;
        }

        .highlight{
            font-weight: 600;
        }

        .item-focused{
            background-color: #f0631b
        }

        .autocomplete-items{
            border-bottom: 1px solid #0000002b;
            padding: 13px;
            cursor: pointer;
        }

        .autocomplete-items:hover {
            background-color: #f0631b;
            color:#fff;
          }
        /* Auto complete css ends */
            
        .wrapper-container{
          bottom: 15px;
          right: 30px;
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index : 501;
          line-height: normal;
          font-size: 16px;
          font-family: 'Mulish', sans-serif;
        }
        .wrapper-msg-container {
          position: fixed;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 0.875em;
          cursor: pointer;
          background-color: var(--bot-message-bg);
          border-radius: 0.5em;
          box-shadow: 0 0 0.625em 0.1475em #0f5d66ed;          
          margin-right: 0.675em;
          bottom: 18px;
          right: 75px;
        }
        .wrapper {
          position: fixed;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          height: 56px;
          width: 56px;
          background-color: var(--chat-title-color);
          border-radius: 30px;
          box-shadow: 0px 0px 8px 2px #0f5d66ed;
          bottom: 15px;
          right: 20px;
          border: none;
      }
      .bot-message-container{
        width: 85%;
        margin-left: 2em;
        margin-bottom: 0.3em;
        display: flex;
        flex-direction: column;
        // position: absolute;
      }
      .chat-window {
            opacity: 0;
            background-color: #fafafa;
            border-radius: 0.875em;
            bottom: 90px;
            box-shadow: rgba(0, 0, 0, 0.24) 1px 4px 15px 0px;
            display: flex;
            flex-direction: column;
            position: fixed;
            right: 20px;
            width: 350px;
            transform: translateX(25%) translateY(35%) scale(0.5, 0.5);
            transition: transform 0.2s ease, opacity 0.2s ease-in, height 0s ease 0.2s;
            height: 0;
            overflow: hidden;
            z-index : 501;
            line-height: normal;
            font-size: 16px;
        }

        .chat-window[opened='true'] {
            height: 98%;
            width: 42%;
            bottom: 11px;
            transform: translate3d(0px, 0px, 0px) scale(1, 1);
            transition: transform 0.2s ease, opacity 0.2s ease-in;
            opacity: 1;
        }
        .hide{
            display: none;
            visibility: hidden;
        }
        .chat-title {
            display: flex;
            justify-content: space-between;
            width: 100%;
            height: 14%;
            background-color: var(--chat-title-color);
            align-items: center;
            padding: 0 1em;
            color: white;
            font-size: 17px;
        }
        .chat-title.scrollGradient{
            box-shadow: 0 3px 8px 0 rgb(18 19 20 / 50%);
            -webkit-box-shadow: 0 3px 8px 0 rgb(18 19 20 / 50%);
            -moz-box-shadow: 0 3px 8px 0 rgb(18 19 20 / 50%); 
        }
        .widget-title{
            margin: 0px 7px;
            font-size: 18px;
        }
        .left-title-container{
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .chat-title #chatbot-logo{
            width: 3rem;
            // background-color:ffffff;
            // border:0.1em solid ffffff;
            // border-radius:50%;
        }
        .buttons-container{
            display: flex;
            margin-right: 1em;
        }
        .buttons-container > div {
          margin-left: 5px;
          border-radius: 25px;
          overflow: hidden;
          border: none;
          padding: 5px;
        }
        .download-container{
          background: #fff;
          z-index: 1050;
          position: absolute;
          top: 40%;
          left: 10%;
          border-radius: 4px;
          width: 80%;
        }
        .download-container a{
          text-decoration: none;
        }
        .download-container .close-btn-container{
          position: absolute;
          right: 7px;
          top: 7px;
          cursor: pointer;
          padding: 4px;
        }
        .download-container .close-btn-container .close-btn-overlay{
          width: 7px;
        }
        .message-container .bot-message a {
            color: blue;
            text-decoration: none;
        }
        .message-container .bot-message a:hover {
            text-decoration: underline;
        }   
        .message-container .bot-message a:visited {
            text-decoration: none;
            color:darkblue;
        }  

        .chat-messages {
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            height: 98%;
            width: 100%;
            overflow-y: hidden;
            z-index:-1;
            position:relative;
        }

        .message-container {
            display: flex;
            flex-direction: column;
            overflow-y: auto;
            overflow-x: hidden;
            scroll-behavior: smooth;
        }
        .message-container .scroll-down {
          position: fixed;
          display: none;
          bottom: 55px;
          right: 15px;
          z-index: 99;
          scrollbar-width: thin;
          border: none;
          outline: none;
          background-color: rgb(181 181 181);
          cursor: pointer;
          padding: 15px;
          border-radius: 4px;
        //   width: 30px;
          height: auto;
          border-radius: 25px;
          overflow: hidden;
        }
        .message-container .scroll-down img {
          width: 10px;
        }
        .outer-user-message-container{
          padding: 0.3em;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          flex: 1 0 auto;
          position: relative;
        }
        .outer-bot-message-container{
          margin-bottom: 0.2em;
          display: flex;
          align-items: center;
          position: relative;
        }
        .multiple-message-container{
          padding: 0.4em;
        }
        .chat-msg-icon{
          width: 25px;
          height: 25px;
          color:#154d86;
          box-shadow: 1px 2px #a19f9f;
          border-radius: 50%;
          position: absolute;
        }
        .mic-icon{
          width: 15px;
          height: 18px;
          color:#154d86;
          box-shadow: 1px 2px #a19f9f;
          border-radius: 50%;
          position: absolute;
          margin: -3 30 -15 10;
        }
        .user-msg-icon {
          width: 25px;
          height: 25px;
          margin-bottom: 1.2rem;
          box-shadow: 1px 2px #a19f9f;
          border-radius: 50%;
          position: absolute;
        }

        // star-feedback css is here 
        .star-container {
            background-image: url("https://www.toptal.com/designers/subtlepatterns/patterns/concrete-texture.png");
            display: flex;
            flex-wrap: wrap;
            height: 30vh;
            align-items: center;
            justify-content: center;
            padding: 0 20px;
          }
          
          .star-rating {
            display: flex;
            width: 100%;
            justify-content: center;
            overflow: hidden;
            flex-direction: row-reverse;
            // height: 150px;
            position: relative;
          }
          
          
          .star-rating > input {
            display: none;
          }
          
          .star-rating > label {
            cursor: pointer;
            width: 30px;
            height: 30px;
            // margin-top: auto;
            background-color:#eaeaea;
            background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='126.729' height='126.73'%3e%3cpath fill='white' d='M121.215 44.212l-34.899-3.3c-2.2-.2-4.101-1.6-5-3.7l-12.5-30.3c-2-5-9.101-5-11.101 0l-12.4 30.3c-.8 2.1-2.8 3.5-5 3.7l-34.9 3.3c-5.2.5-7.3 7-3.4 10.5l26.3 23.1c1.7 1.5 2.4 3.7 1.9 5.9l-7.9 32.399c-1.2 5.101 4.3 9.3 8.9 6.601l29.1-17.101c1.9-1.1 4.2-1.1 6.1 0l29.101 17.101c4.6 2.699 10.1-1.4 8.899-6.601l-7.8-32.399c-.5-2.2.2-4.4 1.9-5.9l26.3-23.1c3.8-3.5 1.6-10-3.6-10.5z'/%3e%3c/svg%3e");
            background-repeat: no-repeat;
            // background-position: center;
            background-size: 80%;
            transition: .3s;
          }
          
          .star-rating > input:checked ~ label,
          .star-rating > input:checked ~ label ~ label {
            background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='126.729' height='126.73'%3e%3cpath fill='gold' d='M121.215 44.212l-34.899-3.3c-2.2-.2-4.101-1.6-5-3.7l-12.5-30.3c-2-5-9.101-5-11.101 0l-12.4 30.3c-.8 2.1-2.8 3.5-5 3.7l-34.9 3.3c-5.2.5-7.3 7-3.4 10.5l26.3 23.1c1.7 1.5 2.4 3.7 1.9 5.9l-7.9 32.399c-1.2 5.101 4.3 9.3 8.9 6.601l29.1-17.101c1.9-1.1 4.2-1.1 6.1 0l29.101 17.101c4.6 2.699 10.1-1.4 8.899-6.601l-7.8-32.399c-.5-2.2.2-4.4 1.9-5.9l26.3-23.1c3.8-3.5 1.6-10-3.6-10.5z'/%3e%3c/svg%3e");
          }
          
          
          .star-rating > input:not(:checked) ~ label:hover,
          .star-rating > input:not(:checked) ~ label:hover ~ label {
            background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='126.729' height='126.73'%3e%3cpath fill='gold' d='M121.215 44.212l-34.899-3.3c-2.2-.2-4.101-1.6-5-3.7l-12.5-30.3c-2-5-9.101-5-11.101 0l-12.4 30.3c-.8 2.1-2.8 3.5-5 3.7l-34.9 3.3c-5.2.5-7.3 7-3.4 10.5l26.3 23.1c1.7 1.5 2.4 3.7 1.9 5.9l-7.9 32.399c-1.2 5.101 4.3 9.3 8.9 6.601l29.1-17.101c1.9-1.1 4.2-1.1 6.1 0l29.101 17.101c4.6 2.699 10.1-1.4 8.899-6.601l-7.8-32.399c-.5-2.2.2-4.4 1.9-5.9l26.3-23.1c3.8-3.5 1.6-10-3.6-10.5z'/%3e%3c/svg%3e");
          }
          
          
          
          
          #rating-1:checked ~ .emoji-wrapper > .emoji { transform: translateY(-100px); }
          #rating-2:checked ~ .emoji-wrapper > .emoji { transform: translateY(-200px); }
          #rating-3:checked ~ .emoji-wrapper > .emoji { transform: translateY(-300px); }
          #rating-4:checked ~ .emoji-wrapper > .emoji { transform: translateY(-400px); }
          #rating-5:checked ~ .emoji-wrapper > .emoji { transform: translateY(-500px); }
          
          .star-feedback {
            background-color: #eaeaea;
            border-radius: 8px;
            padding: 0.75rem 0.5rem 0.5rem 0.75rem;
            border-top-left-radius: 0.7em;
            border-top-right-radius: 0.7em;
            border-bottom-right-radius: 0.7em;
            border-bottom-left-radius: 0;
            display: flex;
            flex-direction: column;
            flex-wrap: wrap;
            align-items: center;
            border: 1px solid #e0e0e0;
          }
          // star-feedback css ends here 
          *{
            box-sizing: border-box;
            max-width:3.5rem;
          }
          
          .icici-avatar{
            width: 80%;
            height: 80%;
            position: relative;
          }
          .icici-avatar-status{
            border-radius: 100%;
            position: absolute;
            bottom: 7%;
            right: 7%;
            display: block;
            width: 16%;
            height: 16%;
            border-width: 1px;
            border-style: solid;
          }
          .icici-avatar-image{
            width: 100%;
            height: 100%;
            border-radius: 100%;
            overflow:-moz-hidden-unscrollable;
            -webkit-box-shadow: 0 0 7px 0 rgb(0 0 0 / 15%);
            box-shadow: 0 0 7px 0 rgb(0 0 0 / 15%);
            background-color: #eaeaea;
            justify-items: center;
          }
          .icici-avatar-status{
            border-color: rgb(255, 255, 255);
            background: #3ef059;
            /* rgb(105, 222, 64); */
          }
          .lazy-img-loaded{
            width:100%;
            height: auto;
          }
 
        //end status css
        // .absolute{
        //     position: absolute
        // }
        .chat-outer-div{
            position:relative;
            overflow:hidden;
            width:100%;
        }
        .chat-icon-div{
          width: 25px;
          height: 25px;
          display: flex;
          justify-content: center;
          align-items: center;
          position: absolute;
          bottom: 0;
          margin-bottom: 0.3em;
          float: left;
        }
        .user-icon-div{
            width: 25px;
            height: 25px;
            display: flex;
            justify-content: center;
            align-items: center;
            position: absolute;
            bottom: 0;
            margin-bottom: 1em;
            float: left;
          }
        .last-item{
          order:2;
        }
        .flex-center{
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .flex-col{
          display: flex;
          flex-direction:column;
          align-items: center;
          justify-content: center;
        }
        .confirm-txt{
          margin-bottom: 15px;
          text-align: center;
          font-size: 14px;
        }
        .download-btn{
          font-size: 0.9em;
          background-color: #f0631b;
          color: #fff;
          width: fit-content;
          padding: 6px 15px;
          border-radius: 4px;
          cursor: pointer;
          border:none;
          transform: translateY(-0.8px);
        }
        .language-btn{
          background-color: #0f5d66;
          color: #fff;
          width: fit-content;
          padding: 5px 15px;
          border-radius: 4px;
          cursor: pointer;
          transform: translateY(-0.8px);
        }
        .chat-icon-skeleton{
          width: 25px;
          height: 25px;
          border-radius: 25px;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-right: 0.3em;
          min-width: 25px;
        }
        .bot-message {
            background-color: #FFFFFF; //redicici#D1CFBB; //eaeaea
            width: fit-content;
            float: left;
            max-width: 70%;
            align-self: flex-start;
            font-size: 16px;
            padding: 0.7em;
            color: var(--bot-message-font-color);
            margin-bottom: 0.05em;
            border: 1px solid #a19f9f;
            border-top-left-radius: 0.7em;
            border-top-right-radius: 0.7em;
            border-bottom-right-radius: 0.7em;
            overflow-wrap: break-word;
            font-weight: 500;
            box-shadow: 2px 3px #a19f9f;
        }
        .bot-loading-messages {
            background-color: #FFFFFF;
            width: fit-content;
            max-width: 50%;
            align-self: flex-start;
            font-size: 16px;
            padding: 0.7em;
            color: var(--bot-message-font-color);
            margin: 0.25em 0 0.75em 0.5em;
            border: 1px solid #a19f9f;
            border-top-left-radius: 0.7em;
            border-top-right-radius: 0.7em;
            border-bottom-right-radius: 0.7em;
            overflow-wrap: break-word;
            box-shadow: 2px 3px #a19f9f;
            margin-left: 2em;
            margin-bottom: 0.3em;
        }
        .btn-animate-hover{
            display: flex;
            justify-content: center;
            align-items: center;
            border: 1px solid transparent;
            box-sizing: border-box;
            cursor: pointer;
            outline: none;
            -webkit-tap-highlight-color: transparent;
            min-width: 0;
            position: relative;
        }
        .btn-animate-hover:focus-visible{
          box-shadow: 0 0 2px 3px rgb(3,103,189);
          -webkit-box-shadow: 0 0 2px 3px rgb(3,103,189);
          -moz-box-shadow: 0 0 2px 3px rgb(3,103,189);
        }
        .download-btn:focus-visible{
          box-shadow: 0 0 2px 3px rgb(3,103,189);
          -webkit-box-shadow: 0 0 2px 3px rgb(3,103,189);
          -moz-box-shadow: 0 0 2px 3px rgb(3,103,189);
        }
        .btn-animate-hover:after {
            border: none;
            opacity: 0;
            content: "";
            position: absolute;
            transition-duration: .15s;
            transition-timing-function: cubic-bezier(.4,0,.2,1);
            transform: scale(0);
            transition-property: transform,opacity;
            border-radius: 4px;
            bottom: 0;
            left: 0;
            right: 0;
            top: 0;
        }
        .wrapper-message{
          padding: 0.6em 1.5em 0.6em 1em;
        }
        .wrapper-msg-container #close-btn{
          width: 12px;
        }
        .wrapper-msg-container .close-btn-container{
          display: block;
          position: absolute;
          right: 2px;
          top: 3px;
        }
        .btn-animate-hover:hover:after {
            // background-color: rgb(173 170 173 / 41%);
            background-color: #2196f6;
            opacity: 0.5;
            border: none;
            // opacity: 1;
            transform: scale(1);
        }
        .user-message {
            position: relative;
            float: right;
            font-size: 16px;
            background-color: #f0631b;
            max-width: 85%;
            align-self: flex-end;
            padding: 0.7em;
            color: white ;
            margin-bottom: 0.25em;
            border: 1px solid #a19f9f;
            border-top-left-radius: 0.7em;
            border-top-right-radius: 0.7em;
            border-bottom-left-radius: 0.7em;
            overflow-wrap: break-word;
            font-weight: 500;
            box-shadow: 2px 3px #b16a29;
        }
        .user-message-container .time-div{
          align-self: flex-end;
        }
        .time-div{
          color: #766f6f;
          font-size: 12px;
          margin-left: calc(0.4em + 25px);
          margin-bottom: 0.4em;
        }
        .user-message-container{
          display: flex;
          flex-direction: column;
          align-self: flex-end;
          margin-right: 2em;
          width: 85%;
        }
        .margin10{
            margin: 10px;
        }
        .marginR10{
            margin-right:10px;
        }
        .marginR5{
            margin-right:5px;
        } 
        .hidden{
          display:none;
        }
        .minimize-icon{
          width: 1.8em;
        }
        .speaker-icon{

            cursor:pointer;
            height:20px;
            margin-left:50px;
            height:20px;
            width:27px;
            margin-botton:10px;
            border-radius:30%;
            border-color:none;
            // background: #fff;
            margin
        }
        .table, .image{
            align-items: center;
            background-color: white;
            border-radius: 4px;
            border: 1px solid;
            border-color: #e0e0e0;
            box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.24);
            color: black;
            padding: 5px;
            font-size: 14px;
            margin-bottom: 4px;
        }
        .table-container .table-col{
            padding: 5px;
        }
        .table .header-row{
            font-weight: 600;
        }
        .table .table-row .table-col{
          min-width: 85px;
        }
        .table .highlight-row{
          background-color: #EBF6FF;
        }
        .message-container .img-container{
            padding: 2px;
            width: 55%;
        }
        .width50{
            width: 50%;
        }
        .width100{
            width: 100%;
        }
        .message-container .image{
            width: 60%;
            padding: 0px;
            border: 1.5px solid #0f5d66ed;
        }
        .message-container .image:hover{
            -webkit-box-shadow: 10px 10px 5px -4px rgba(173,170,173,0.73);
            -moz-box-shadow: 10px 10px 5px -4px rgba(173,170,173,0.73);
            box-shadow: 10px 10px 5px -4px rgba(173,170,173,0.73);
        }
        .suggestion-chip {
          align-items: center;
          background-color: #FFFFFF;
          border-radius: 12px;
          border: 1px Solid #e6a267;
          color: #f0631b;
          cursor: pointer;
          display: inline-flex;
          font-size: 0.875em;
          margin-right: 0.4em;
          margin-bottom: 0.25em;
          padding: 8px 12px;
          text-decoration: none;
          vertical-align: bottom;
          text-align: left;
          font-weight: 500;
          box-shadow: 1px 2px #e6a267;
        }
        .suggestion-chip:hover{
            background-color:#f0631b;
            color: #ffffff;
            box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.24);
            transform: translateY(-0.8px);
        }
        .download-overlay {
          position: fixed;
          top: 0;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 1048;
          background-color: #333;
          opacity: 0;
        }
        .confirm-container{
          padding: 1.6rem 0.8rem 0.8rem 0.8rem;
        }
        .message-container .dropdown {
            border: 1px solid gray;
            border-radius: 4px;
            padding: 10px 30px 10px 20px;
            background-color: #ffffff;
            cursor: pointer;
            white-space: nowrap;
            width: 60%;
        }

        .chat-footer {
            border-top: 1px solid #D1CFBB;
            display: flex;
            align-items: center;
            background: #fff;
            position:relative;
        }
        .chat-footer img {
          position:absolute;
          right:15px;
          top:15px;
        }
        .chat-footer .suggestion-dropdown{
            position: absolute;
            border: 1px solid #d4d4d4;
            border-bottom: none;
            border-top: none;
            z-index: 99;
            left: 0;
            right: 0;
            bottom: 45px;
            background: #fff;
            border-top-left-radius: 20px;
            border-top-right-radius: 20px;
            box-shadow: 0px -3px 5px #d4d4d4;
            padding: 5px 10px 0px 10px;
            max-height: 32%;
            overflow: auto;
        }
        .chat-footer .suggestion-dropdown .suggestion-strip{
            padding: 5px 0px;
            border-bottom: 1px solid #e0e0e0;
            cursor: pointer;
            padding: 6px;
            border-radius: 15px;
            margin: 2px 0px;
            width: 99%;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .chat-footer .suggestion-dropdown .suggestion-strip:hover {
            background-color: #EBF6FF;
        }
        .chat-footer .refresh-button-container{
            width: 10%;
            background: #9a9a9a;
            border-radius: 25px;
            margin-left: 5px;
        }
        .chat-input {
            height: 45px;
            width: 84%;
            border: none;
            padding: 0 1em 0 1.4em;
            font-size: 16px;
        }

        .chat-input:focus {
            outline: none;
        }

        .chat-send-button {
            cursor: pointer;
            display: none;
        }
        .tooltip {
          position: relative;
          display: inline-block;
        }
        
        .tooltip .tooltip-text {
          visibility: hidden;
          width: 100px;
          background-color: #555;
          color: #fff;
          text-align: center;
          border-radius: 6px;
          padding: 5px 0;
          position: absolute;
          z-index: 1;
          top: 120%;
          left: -50%;
          margin-left: -60px;
          opacity: 0;
          transition: opacity 0.3s;
          font-size: 14px
        }
        
        .tooltip .tooltip-text::after {
          content: " ";
          position: absolute;
          bottom: 100%;  /* At the top of the tooltip */
          left: 85%;
          margin-left: -5px;
          border-width: 5px;
          border-style: solid;
          border-color: transparent transparent #555 transparent;
        }
        
        .tooltip:hover .tooltip-text {
          visibility: visible;
          opacity: 1;
        }
        #q-icon {
          width: 4.075em;
        }
        #close-icon {
          width: 1.5em;
          display: none;
          -webkit-animation:spin 0.2s linear;
          -moz-animation:spin 0.2s linear;
          animation:spin 0.2s linear;
        }
        .header-button {
          width: 1.8em;
          cursor: pointer;
        }
        .language-buttons-container button{
          background-color: #0f5d66ed;
          color: #fff;
          font-weight: 600;
          margin-bottom: 0.4em;
          border: none;
          padding: 0.4em 0.8em;
          border-radius: 0.2em;
          width: 40%;
          cursor: pointer;
        }
        .notification-outer-container:after {
          content: '';
          display: block;
          position: fixed;
          width: 0;
          height: 0;
          border-color: transparent transparent #053C6D transparent;
          border-style: solid;
          border-width: 0.6em;
          top: 2.2em;
          right: 5.6em;
        }
        .notification-outer-container{
          position: absolute;
          z-index:1;
          width: auto;
          font-size: 0.875em;
          top: 3.3em;
          right: 10px;
          background-color: #053C6D;
        }
        .notification-inner-container{
          padding: 0.1rem 0.4rem;
        }
        button{
          background:none;
        }  
        .bot-message ol,ul{
          margin: 0.2em 0;
          padding: 0;
        }
        .bot-message li{
          margin: 0.1em 0 0 1em;
          padding: 0.1em;
        }
        @-moz-keyframes spin { 100% { -moz-transform: rotate(180deg); } }
        @-webkit-keyframes spin { 100% { -webkit-transform: rotate(180deg); } }
        @keyframes spin { 100% { -webkit-transform: rotate(180deg); transform:rotate(-90deg); } }
        @keyframes fade {
            0% { opacity: 0 }
            50% { opacity: 0.5 }
            100% { opacity: 1 }
        }
        @-webkit-keyframes fadeOut {
          0% {opacity: 1;}
          100% {opacity: 0;}
       }
       
       @keyframes fadeOut {
          0% {opacity: 1;}
          100% {opacity: 0;}
       }
       @-webkit-keyframes fadeIn {
        0% {opacity: 0;}
        100% {opacity: 1;}
      }
      
      @keyframes fadeIn {
          0% {opacity: 0;}
          100% {opacity: 1;}
      }
        @keyframes dots {
          0%, 20% {
            color: #000;
            text-shadow: 0.25em 0 0 #fff, 0.5em 0 0 #fff;
          }
          40% {
            color: #fff;
            text-shadow: 0.25em 0 0 #000, 0.5em 0 0 #000;
          }
          60% {
            text-shadow: 0.25em 0 0 #000, 0.5em 0 0 #000;
          }
          80%, 100% {
            text-shadow: 0.25em 0 0 #fff, 0.5em 0 0 #fff;
          }
        }
        ::-webkit-scrollbar {
            width: 0.45em;
            scrollbar-width: thin;
        }

        /* Track */
        ::-webkit-scrollbar-track {
        background-color: #ffffff;
        }

        /* Handle */
        ::-webkit-scrollbar-thumb {
        background: #9a9a9a;
        height: 5px;
        border-radius: 10px;
        }

        @media screen and (max-width: 501px) {
            body {
                margin: 0;
            }
            .chat-window[opened='true'] {
                max-height: none;
                width: 100%;
                right: 0;
                bottom: 0;
                height: 100%
            }
            .notification-outer-container{
              top: 3.1em;
              right: 3em;
            }
            .notification-outer-container:after{
              top: 2em;
              right: 6.2em;
            }
            .chat-title {
                width: 97%;
                height: 20%;
                max-height: 50px;
            }
            .suggestion-chip{
              max-width: 80%;
              border-radius:50%;
            }
            .chat-messages {
                height: 100%;
                max-height: none;
            }
            .expanded {
                visibility: hidden;
            }
            .close-button {
                visibility: visible;
                display: block;
            }
            .wrapper-msg-container {
              font-size: 0.875rem;
            }
            .chat-input::placeholder{
              font-size: 16px;
            }
            .widget-title{
              margin: 0px 4px;
              font-size: 18px;
              text-align:left;
            }
            input[type="text"],
            select:focus{
              font-size: 16px;
            }
          }
        `;
        this.shadow.appendChild(style);
    }
    // _focusInput() {
    //     document.getElementById(`${arr[0]}`).focus();
    // }
    _createWrapper() {
        const wrapperContainer = document.createElement('div');
        wrapperContainer.setAttribute('class', 'wrapper-container');

        const wrapper = document.createElement('button');
        wrapper.setAttribute('class', 'wrapper');
        wrapper.setAttribute('aria-label', 'Open and interact with our virtual assistant ');
        wrapper.onclick = openChatWindow;

        const widgetToggleIcon = document.createElement('img');
        widgetToggleIcon.setAttribute('id', 'q-icon');
        widgetToggleIcon.setAttribute('alt', 'widget toggle button');
        widgetToggleIcon.setAttribute('title', 'Open bot');
        const closeIcon = document.createElement('img');
        closeIcon.setAttribute('id', 'close-icon');
        widgetToggleIcon.src = this.storageUrl + 'icici-icon.png';

        closeIcon.setAttribute('alt', 'close button');
        closeIcon.setAttribute('title', 'Close bot');
        closeIcon.src = this.storageUrl + 'minimize.svg';
        this._createWrapperFloatMessage(wrapperContainer);
        wrapperContainer.appendChild(wrapper);
        this.shadow.appendChild(wrapperContainer);
        wrapper.appendChild(widgetToggleIcon);
        wrapper.appendChild(closeIcon);
    }

    _createWrapperFloatMessage(wrapperContainer) {
        const wrapperMsgContainer = document.createElement('div');
        const shadowDemo = document.querySelector('#shadow');
        const botBgColor = shadowDemo.getAttribute('bot-message-bg-color');
        wrapperMsgContainer.style.setProperty('--bot-message-bg', botBgColor);
        wrapperMsgContainer.setAttribute('class', 'wrapper-msg-container');
        const wrapperMsg = document.createElement('div');
        wrapperMsg.setAttribute('class', 'wrapper-message');
        if (!getCookieValue('languageCode')) {
            setCookie('languageCode', 'en');
        }
        const wrapperText = this.languageMessageMap[getCookieValue('languageCode')].wrapperMessage;
        wrapperMsg.innerHTML = wrapperText;
        wrapperMsgContainer.onclick = openChatWindow;

        const closeBtnContainer = document.createElement('div');
        closeBtnContainer.classList.add('close-btn-container', 'btn-animate-hover');
        const closeBtn = document.createElement('img');
        closeBtn.setAttribute('id', 'close-btn');
        closeBtn.setAttribute('alt', 'close button');
        closeBtn.src = this.storageUrl + 'close-white.png';
        closeBtnContainer.appendChild(closeBtn);

        wrapperContainer.appendChild(wrapperMsgContainer);
        wrapperMsgContainer.appendChild(wrapperMsg);
        wrapperMsgContainer.appendChild(closeBtnContainer);

        closeBtnContainer.addEventListener('click', (event) => {
            wrapperMsgContainer.style.animation = 'fade 1s linear';
            wrapperMsgContainer.style.opacity = '0';
            wrapperMsgContainer.style.display = 'none';
            event.stopPropagation();
        });
    }

    _createChatWindow() {
        const chatWindow = document.createElement('div');
        chatWindow.setAttribute('class', 'chat-window');
        chatWindow.setAttribute('opened', 'false');
        this._createChatTitle(chatWindow);
        this._createChatMessages(chatWindow);
        this._createChatFooter(chatWindow);
        this.shadow.appendChild(chatWindow);
    }

    _createChatTitle(chatWindow) {
        const chatTitle = document.createElement('div');
        chatTitle.setAttribute('class', 'chat-title');

        const leftTitleContainer = document.createElement('div');
        leftTitleContainer.setAttribute('class', 'left-title-container');

        const buttonsContainer = document.createElement('div');
        buttonsContainer.setAttribute('class', 'buttons-container');


        setTimeout(() => {
            const shadowDemo = document.querySelector('#shadow');
            const leftTitleContainer = document.createElement('div');
            leftTitleContainer.setAttribute('class', 'left-title-container');
            const chatTitleText = shadowDemo.getAttribute('chat-title');
            const titleColor = shadowDemo.getAttribute('chat-title-color');
            const botBgColor = shadowDemo.getAttribute('bot-message-bg-color');
            const botFontColor = shadowDemo.getAttribute('chat-bot-font-color');

            const widgetTitle = document.createElement('h2');
            widgetTitle.setAttribute('class', 'widget-title');

            const languageCode = 'en';
            const { botLogoAltText, minimizeIconAltText, refreshIconAltText } = this.languageMessageMap[languageCode];

             //Addition to show status
      const iciciAvatar = document.createElement('div')
      iciciAvatar.setAttribute('class', 'icici-avatar')

      const iciciAvatarStatus = document.createElement('div')
      iciciAvatarStatus.setAttribute('class', 'icici-avatar-status')

      const iciciAvatarImage = document.createElement('div');
      iciciAvatarImage.setAttribute('class', 'icici-avatar-image')

      const iconStatus = document.createElement('div')
      iconStatus.setAttribute('data-status', 'loaded')
      iconStatus.setAttribute('data-cover', 'true')
      iconStatus.setAttribute('class', 'lazy-img')

      const botLogo = document.createElement('img')
      botLogo.setAttribute('title', botLogoAltText)
      botLogo.setAttribute('class', 'lazy-img-loaded')
      botLogo.setAttribute('id', 'chatbot-logo')
      botLogo.setAttribute('alt', botLogoAltText)
      botLogo.src = this.storageUrl + 'icici-icon.png'

      const title = shadow.shadowRoot.querySelector('.chat-title')
      const wrapper = shadow.shadowRoot.querySelector('.wrapper')
      const botMessage = shadow.shadowRoot.querySelector('.bot-message')
      widgetTitle.innerText = chatTitleText

      iconStatus.appendChild(botLogo)
      iciciAvatarImage.appendChild(iconStatus)
      iciciAvatar.appendChild( iciciAvatarImage)
      iciciAvatar.appendChild(iciciAvatarStatus)

      leftTitleContainer.appendChild(iciciAvatar)

            const closeIconContainer = document.createElement('button');
            closeIconContainer.classList.add('btn-animate-hover', 'marginR5');
            closeIconContainer.setAttribute('title', minimizeIconAltText);
            closeIconContainer.setAttribute('id', 'minimize');



            const close = document.createElement('img');
            close.classList.add('header-button', 'minimize-icon');
            close.setAttribute('alt', minimizeIconAltText);
            close.src = this.storageUrl + 'arrow.svg';
            closeIconContainer.onclick = openChatWindow;

            // const speakerIconContainer = document.createElement('img');
            // speakerIconContainer.classList.add('header-button', 'marginR5');
            const speakerIcon = document.createElement('img');
            speakerIcon.classList.add('speaker-icon');
            speakerIcon.setAttribute('alt', 'refresh-chat');

            const refreshIconContainer = document.createElement('button');
            refreshIconContainer.classList.add('btn-animate-hover', 'marginR5');
            const refreshButton = document.createElement('img');
            refreshButton.classList.add('header-button');
            refreshButton.setAttribute('alt', refreshIconAltText);
            refreshIconContainer.setAttribute('title', refreshIconAltText);
            refreshIconContainer.setAttribute('id', 'refresh-chat');
            refreshIconContainer.disabled = true;
            refreshIconContainer.style.opacity = 0.5;
            refreshButton.src = this.storageUrl + 'refresh.svg';
            refreshIconContainer.onclick = confirmRefreshChatModal;

            speakerIcon.src= this.storageUrl + 'speaker5.jpg';

            closeIconContainer.appendChild(close);
            // speakerIconContainer.appendChild(speakerIcon);
            refreshIconContainer.appendChild(refreshButton);
            buttonsContainer.appendChild(refreshIconContainer);
            buttonsContainer.appendChild(closeIconContainer);
            // buttonsContainer.appendChild(soulIconContainer);
            title.appendChild(leftTitleContainer);
            leftTitleContainer.appendChild(widgetTitle);
            title.appendChild(speakerIcon);
            title.appendChild(buttonsContainer);


            title.style.setProperty('--chat-title-color', titleColor);
            wrapper.style.setProperty('--chat-title-color', titleColor);
            if (shadowDemo.querySelector('.bot-message') !== null) {
                botMessage.style.setProperty('--bot-message-bg', botBgColor);
                botMessage.style.setProperty('--bot-message-font-color', botFontColor);
            }
        }, 0);

        chatWindow.appendChild(chatTitle);
    }

    _createChatMessages(chatWindow) {
        const chatMessages = document.createElement('div');
        chatMessages.setAttribute('class', 'chat-messages');
        chatMessages.setAttribute('aria-label', 'Chat');
        chatMessages.setAttribute('role', 'log');
        chatMessages.setAttribute('aria-live', 'polite');

        const messagesContainer = document.createElement('div');
        messagesContainer.setAttribute('class', 'message-container');

        const scrollDownContainer = document.createElement('div');
        scrollDownContainer.classList.add('btn-animate-hover', 'scroll-down');

        const scrollDown = document.createElement('img');
        scrollDown.setAttribute('alt', 'scroll to bottom');
        scrollDown.src = this.storageUrl + 'down-arrow.png';
        scrollDownContainer.appendChild(scrollDown);
        scrollDownContainer.onclick = scrollAtBottom;
        const userId = getCookieValue('user-id');
        this._appendBotMessages(messagesContainer);

        messagesContainer.appendChild(scrollDownContainer);
        chatWindow.appendChild(chatMessages);
        chatMessages.appendChild(messagesContainer);
    }

    _appendBotMessages(messagesContainer, botMessage) {
        if (botMessage) {
        const botMessageDiv = document.createElement('div');
            botMessageDiv.innerText = botMessage;
            botMessageDiv.setAttribute('class', 'bot-loading-messages');
            const outerMessageContainer = document.createElement('div');
            outerMessageContainer.classList.add('outer-bot-message-container', 'loading', 'multiple-message-container');

            const userIconContainer = document.createElement('div');
            userIconContainer.setAttribute('class', 'chat-icon-div');
            const userIcon = document.createElement('img');
            userIcon.setAttribute('class', 'chat-msg-icon');
            userIcon.setAttribute('alt', 'icicibot');
            userIcon.src = this.storageUrl + 'Bot_icon.png'

            userIconContainer.appendChild(userIcon);
            outerMessageContainer.appendChild(userIconContainer);
            outerMessageContainer.appendChild(botMessageDiv);
            if (botMessageDiv) {
                const shadowDemo = document.querySelector('#shadow');
                if (shadowDemo !== null) {
                    const botBgColor = shadowDemo.getAttribute('bot-message-bg-color');
                    const botFontColor = shadowDemo.getAttribute('chat-bot-font-color');

                    botMessageDiv.style.setProperty('--bot-message-bg', botBgColor);
                    botMessageDiv.style.setProperty('--bot-message-font-color', botFontColor);
                }
            }
            if (botMessage === '.') {
                botMessageDiv.style.animation = 'dots 1s steps(5, end) infinite';
                botMessageDiv.style.paddingRight = '1.5em';
            }
            messagesContainer.appendChild(outerMessageContainer);
            outerMessageContainer.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
        }else {
            document.cookie = "isflag" + '=' + true;
        }
        }


    _createChatFooter(chatWindow) {
        const messagesContainer = chatWindow.querySelector('.message-container');

        const chatFooter = document.createElement('div');
        chatFooter.setAttribute('class', 'chat-footer');
        const micIcon = document.createElement('img');
        micIcon.setAttribute('class', 'mic-icon');
        micIcon.setAttribute('alt', 'Mic');
        micIcon.src = this.storageUrl + 'mic.png';

        this._createChatInput(chatFooter, messagesContainer);

        chatWindow.appendChild(chatFooter);
        chatFooter.appendChild(micIcon);
    }

    _createChatInput(chatFooter, messagesContainer) {
        const chatInput = document.createElement('input');
        chatInput.setAttribute('class', 'chat-input');
        chatInput.setAttribute('type', 'text');
        const languageCode = 'en';
        const placeholderText = this.languageMessageMap[languageCode].placeholder;
        chatInput.setAttribute('placeholder', placeholderText);
        chatInput.setAttribute('aria-label', placeholderText);
        chatInput.setAttribute('maxlength', '255');

        const chatSendButton = document.createElement('img');
        chatSendButton.setAttribute('class', 'chat-send-button');
        chatSendButton.setAttribute('title', 'Send message');
        chatSendButton.setAttribute('alt', 'send chat button');
        chatSendButton.src = this.storageUrl + 'blue-send.svg';

        const chatDisabledSendButton = document.createElement('img');
        chatDisabledSendButton.setAttribute('class', 'chat-disabled-send-button');
        chatDisabledSendButton.setAttribute('alt', 'send chat button');
        chatDisabledSendButton.src = this.storageUrl + 'gray-send.svg';
        chatSendButton.onclick = this._sendMessage.bind(this);

        this._inputListener(chatInput, chatSendButton, chatDisabledSendButton);
        const self = this;

        chatFooter.appendChild(chatInput);
        chatFooter.appendChild(chatSendButton);
        chatFooter.appendChild(chatDisabledSendButton);
        setAccessibility(false);
    }

    _sendMessage(customParameter) {
        customParameter = customParameter && customParameter.currentTarget ? null : customParameter;
        const chatInput = this.shadow.querySelector('.chat-input');

        if (chatInput.value.trim()) {
            const chatSendButton = this.shadow.querySelector('.chat-send-button');
            const chatDisabledSendButton = this.shadow.querySelector('.chat-disabled-send-button');
            const messagesContainer = this.shadow.querySelector('.message-container');
            let messageText = chatInput.value;
            if(messageText == 'Start Over') {
                confirmRefreshChatModal();
            }
            else {
                if (!this.addrSelected && this.addrSuggestionShown) {
                    let firstAddress = null;
                    if (this.addressCandidates && this.shadow.querySelector('.suggestion-dropdown') && this.addressCandidates.length) {
                        firstAddress = this.addressCandidates[0];
                    }
                    messageText = (firstAddress && firstAddress.address) || messageText;
                    customParameter = (firstAddress && firstAddress.customLocation) || {};
                    Object.assign(customParameter);
                }
                // remove address suggestions
                if (this.shadow.querySelector('.suggestion-dropdown')) {
                    this.shadow.querySelector('.suggestion-dropdown').remove();
                }
                this.addrSuggestionShown = false;
                const userMessageContainer = document.createElement('div');
                userMessageContainer.setAttribute('class', 'user-message-container');
    
                const outerMessageContainer = document.createElement('div');
                outerMessageContainer.setAttribute('class', 'outer-user-message-container');
    
                const userMessage = document.createElement('div');
                userMessage.innerText = messageText;
                const userIconContainer = document.createElement('div');
                userIconContainer.setAttribute('class', 'user-icon-div last-item');
                const userIcon = document.createElement('img');
                userIcon.setAttribute('class', 'user-msg-icon');
                userIcon.setAttribute('alt', 'You');
                userIcon.src = this.storageUrl + 'emp-icon2.png';
    
                userIconContainer.appendChild(userIcon);
    
                const timeDiv = document.createElement('div');
                timeDiv.setAttribute('class', 'time-div');
                timeDiv.innerHTML = getFormattedDateTime(new Date());
                userMessageContainer.appendChild(userMessage);
                userMessageContainer.appendChild(timeDiv);
                outerMessageContainer.appendChild(userIconContainer);
                outerMessageContainer.appendChild(userMessageContainer);
                messagesContainer.appendChild(outerMessageContainer);
                userMessage.setAttribute('class', 'user-message');
                outerMessageContainer.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
                chatInput.value = '';
                chatSendButton.style.display = 'none';
                chatDisabledSendButton.style.display = 'block';
                this._webhookApi(messageText, false, customParameter);
                const shadowDemo = document.querySelector('#shadow');
    
                const userBgColor = shadowDemo.getAttribute('user-message-bg-color');
                const userFontColor = shadowDemo.getAttribute('chat-user-font-color');
    
                userMessage.style.setProperty('--user-message-bg', userBgColor);
                userMessage.style.setProperty('--user-message-font-color', userFontColor);
                chatInput.focus();
    
                // stop auto complete functionality
                stopAutocomplete();
    
                // disable TextField flag false to enable input box
                if(disableTextFieldFlag){
                    disableTextFieldFlag = false;
                    this._enableChatInput();
                }
            }
        }
    }

    _inputListener(chatInput, chatSendButton, chatDisabledSendButton) {
        chatInput.addEventListener('keyup', (event) => {
            let inputText = event.target.value.trim();
            enableDisableSendButton(inputText)
            // Code to send first autocomplete item to webhook on enter
            if ((event.keyCode === 13 && inputText) && (shadowDemoAC.querySelector('.autocomplete-items')) && (shadowDemoAC.querySelector('.autocomplete-items').className === 'autocomplete-items')){
                const item = shadowDemoAC.querySelector('.autocomplete-items');
                inputText = item.getAttribute('value');
                event.target.value = inputText;
                this._sendMessage();
            } else if (event.keyCode === 13 && inputText) {
                this._sendMessage();
            }
            
        });
        chatInput.addEventListener('paste', (event) => {
            const inputText = (event.clipboardData || window.clipboardData).getData('text');
            enableDisableSendButton(inputText.trim())
        });

        function enableDisableSendButton(inputText) {
            if (inputText) {
                chatSendButton.style.display = 'block';
                chatDisabledSendButton.style.display = 'none';
            } else {
                chatSendButton.style.display = 'none';
                chatDisabledSendButton.style.display = 'block';
            }
        }
    }

    _webhookApi(message, isNewSession = false, customParams = {}) {
        customParams = customParams || {};
        isNewSession = isNewSession || false;
        message = message.trim();
        console.log(message);
        const shadow = document.querySelector('#shadow');
        const detectIntentEndpoint = `${this.baseURL}/is/api/v1/dialogflow/detect-intent`;
        this.userId = getCookieValue('user-id');
        const date = new Date();
        const timezoneOffset = date.getTimezoneOffset();
        const customParameters = Object.assign(customParams, { timezoneOffset: timezoneOffset, BU: 'iPal' });
        const languageCode = 'en';
        if (!this.userId) {
            this.userId = uuidv4();
            setCookie('user-id', this.userId);
        }

        // let body = {};

        if (isNewSession) {
            sessionId = Math.random().toString(36).substring(7);
            //  body = {
            //     message: message,
            //     userId: this.userId,
            //     languageCode: languageCode,
            //     isNewSession: isNewSession || false,
            //     customParams: customParameters || {},
            //     sessionId: sessionId,
            //     sessionExpiryCount: sessionExpiryCount,
            //     // conversationFlow:'df'
            // };
        }
        //  else{
        const body = {
            message: message,
            userId: this.userId,
            languageCode: languageCode,
            isNewSession: isNewSession || false,
            customParams: customParameters || {},
            sessionId: sessionId,
            sessionExpiryCount: sessionExpiryCount,
            // conversationFlow:'df'
            // conversationFlow: isNewSession? 'wlcmMsg':'voiceBanking'
        // };
    }
        const authHeader = btoa(`${atob(this.userName)}:${atob(this.password)}`);
        const Http = new XMLHttpRequest();
        Http.open('POST', detectIntentEndpoint, true);
        Http.setRequestHeader('content-type', 'application/json; charset=UTF-8');
        Http.setRequestHeader('Authorization', `Basic ${authHeader}`);
        Http.send(JSON.stringify(body));
        Http.responseType = 'json';
        const messagesContainer = this.shadow.querySelector('.message-container');
        this._appendBotMessages(messagesContainer, '.');
        messagesContainer.querySelectorAll('.removable').forEach(ele => {
            ele.style.animation = 'fade 1s linear';
            ele.style.opacity = '0';
            ele.style.display = 'none';
            setTimeout(function () {
                ele.remove();
            }, 1000);
        });
        Http.onreadystatechange = (e) => {
            if(Http.readyState == 4){
                const data ={
                    "queryResult":{
                        "responseMessages":[{
                            "text":{
                                "text":[
                                    "Welcome to iPal assistant"
                                ]
                        }},
                            {
                                "payload":{
                                    "fields":{
                                        "richContent":[
                                            {
                                                "type":"table",
                                                "hasHeader":true,
                                                "options":[["row1"], ["row2"]],
                                                "headerText":[["one"],["two"],["three"]],
                                                "footerText":[["one"],["two"],["three"]],
                                            }
                                        ]

                                    }
                                }
                            }
                        ]
                    }
                 
                }
                // this._showChatMessages(data,false,'apiResponse');

            }
            enableRefreshButton();
            if (Http.response && Http.response.data) {
                this._showChatMessages(Http.response.data, undefined, 'apiResponse');
            } else {
                const messageContainer = this.shadow.querySelector('.message-container');
                messageContainer.querySelectorAll('.loading').forEach(e => e.remove());
                if (Http.status != 200 || Http.response?.status === "error") {
                    webhookApiFailed();
                }
            }
        };
        clearTimeout(idleTime);
        idleTime = setTimeout(() => {
            confirmRefreshChat();
            sessionExpiryCount++;
        }, sessionExpiryTime)
        time = new Date().getTime();
        
    }

    _showChatMessages(response, isLastMessage, flag = '') {
        flag = flag || '';
        const messageContainer = this.shadow.querySelector('.message-container');
        if (response.displayName) {
            (response.displayName === 'End Session' && flag === 'apiResponse') && confirmRefreshChat(3000)
        }
        console.log(response);
        // let fulfillmentMessage = response.queryResult.responseMessages[1].payload.fields.richContent.filter(obj => {
        //     return (obj.type !== undefined)
        // })
        let fulfillmentMessage = response.data.filter(obj => {
            return (obj.fields !== undefined || obj.text !== undefined || obj.type!==undefined);
            
        });
        console.log(fulfillmentMessage);


        if (fulfillmentMessage && fulfillmentMessage.length) {

            const multipleMessageContainer = document.createElement('div');
            multipleMessageContainer.setAttribute('class', 'multiple-message-container');
            messageContainer.appendChild(multipleMessageContainer);

            fulfillmentMessage.forEach((message, i) => {
                // console.log(message.type);
                if (message && message.fields) {
                    console.log(message);
                    const autoCompleteOptions = message.fields && message.fields.autocompleteData
                    console.log(autoCompleteOptions+'dsfsfsdfsdf');
                    const fields = message.fields;
                    console.log(fields);
                    disableTextFieldFlag = message.fields && message.fields.disableTextFieldFlag;
                    
                    let type = fields && fields.type;
                
                    // enabling autocomplete dropdown
                    // if (autoCompleteOptions) {
                    //     autocompleteData = fields.autocompleteData
                    //     startAutocomplete();
                    //     type = 'autocomplete';
                    // }

                    !((flag === 'chatHistory' || flag === 'downloadHistory') && (type === 'chips' || type === 'autocomplete' ) && !isLastMessage) &&                        // if(true){  
                    this._renderCustomResponseType(fields, messageContainer, (fulfillmentMessage.length - 1 === i), multipleMessageContainer, { response: response, flag: flag, isFirstMsg: i === 0 }, type);
                    
                
                if(message && message.type){
                    // console.log(message.fields);
                    let fields = response.queryResult.responseMessages[1].payload.fields;
                    console.log(fields);
                    let type = message.type;
                    if(type === 'table'){
         this._renderCustomResponseType(fields, messageContainer, (fulfillmentMessage.length - 1 === i), multipleMessageContainer, { response: response, flag: flag, isFirstMsg: i === 0 }, type);

                    }

                }
            }
                else if (message && message.text) {
                    const botMessage = message && message.text
                    if (botMessage) {
                        const isLastMsg = (fulfillmentMessage.length - 1 === i);
                        this._insertBotMessages(botMessage, messageContainer, isLastMsg, multipleMessageContainer, { response: response, flag: flag, isFirstMsg: i === 0 });
                    } else {
                        removeBotMessageContainer(messageContainer);
                    }
                }
            });
        
    }
}

    _insertBotMessages(botMessage, messagesContainer, isLastMsg = false, multipleMessageContainer, customObj = {}) {
        isLastMsg = isLastMsg || false;
        customObj = customObj || {};
        const flag = customObj.flag;
        
        const BotMessage = document.createElement('div');
        BotMessage.innerHTML = botMessage;
        BotMessage.setAttribute('class', 'bot-message');
        const BotMessageContainer = document.createElement('div');
        BotMessageContainer.setAttribute('class', 'bot-message-container');
        const botOuterContainer = document.createElement('div');
        const botIconContainer = document.createElement('div');
        botOuterContainer.setAttribute('class', 'chat-outer-div');
        botIconContainer.setAttribute('class', 'chat-icon-div');
        const botIcon = document.createElement('img');
        botIcon.setAttribute('class', 'chat-msg-icon');
        botIcon.setAttribute('alt', 'Merva');
        botIcon.src = this.storageUrl + 'Bot_icon.png';
        botIconContainer.appendChild(botIcon);
        BotMessageContainer.appendChild(BotMessage);
        const outerMessageContainer = document.createElement('div');
        outerMessageContainer.setAttribute('class', 'outer-bot-message-container');
        outerMessageContainer.appendChild(botOuterContainer);
        botOuterContainer.appendChild(botIconContainer);
        botOuterContainer.appendChild(BotMessageContainer);
        multipleMessageContainer.appendChild(outerMessageContainer);
        if (isLastMsg) {
            let date;
            if (customObj && customObj.flag === 'chatHistory') {
                date = (customObj.response && new Date(customObj.response.createdAt)) || new Date();
            } else {
                date = new Date();
            }
            const timeDiv = document.createElement('div');
            timeDiv.setAttribute('class', 'time-div');
            timeDiv.innerHTML = getFormattedDateTime(date);
            multipleMessageContainer.appendChild(timeDiv);
            messagesContainer.appendChild(multipleMessageContainer);
        }
        if (BotMessage) {
            const shadowDemo = document.querySelector('#shadow');
            if (shadowDemo !== null) {
                const botBgColor = shadowDemo.getAttribute('bot-message-bg-color');
                const botFontColor = shadowDemo.getAttribute('chat-bot-font-color');
                BotMessage.style.setProperty('--bot-message-bg', botBgColor);
                BotMessage.style.setProperty('--bot-message-font-color', botFontColor);
            }
        }
        messagesContainer.querySelectorAll('.loading').forEach(e => e.remove());
        multipleMessageContainer.scrollIntoView(false);

        const chatWindow = shadow.shadowRoot.querySelector('.chat-window').getAttribute('opened');
        if (chatWindow !== 'true') setAccessibility(false);
    }

    _updateChipText(chip) {
        chip.addEventListener('click', () => {
            const chatInput = this.shadow.querySelector('.chat-input');
            chatInput.value = chip.innerText;
            if (chatInput.value) {
                // for obtaining { language: languageCode } mapping
                let messageLanguageCodeMap = {};
                for (const [languageCode, languageCodeProperties] of Object.entries(this.languageMessageMap)) {
                    Object.assign(messageLanguageCodeMap, { [languageCodeProperties['language']]: languageCode })
                }

                const languageCode = 'en';

                if (messageLanguageCodeMap.hasOwnProperty(chatInput.value.toLowerCase())) {
                    const language = chatInput.value.toLowerCase();
                    const isNewSession = messageLanguageCodeMap[language] !== languageCode;
                    if (isNewSession) {
                        chatInput.value = '';
                        const userOptedLanguageCode = messageLanguageCodeMap[language];
                        confirmLanguageChange(userOptedLanguageCode);
                        return;
                    }
                } else {
                    this._sendMessage();
                }
            }
        });
    }

    _renderCustomResponseType(fields = {}, messagesContainer = {}, isLastMsg = false, multipleMessageContainer, customObj = {}, type) {
        fields = fields || {};
        console.log('Hi from render custom');
        messagesContainer = messagesContainer || {};
        isLastMsg = isLastMsg || false;
        customObj = customObj || {};
        const outerBotMessageContainer = document.createElement('div');
        const newOuterBotMessageContainer = document.createElement('div');
        outerBotMessageContainer.setAttribute('class', 'outer-bot-message-container');
        newOuterBotMessageContainer.setAttribute('class', 'outer-bot-message-container');
        const iconContainer = document.createElement('div');
        const newIconContainer = document.createElement('div');
        iconContainer.setAttribute('class', 'chat-icon-skeleton');
        newIconContainer.setAttribute('class', 'chat-icon-skeleton');
        newOuterBotMessageContainer.appendChild(newIconContainer);
        outerBotMessageContainer.appendChild(iconContainer);

        const options = (fields && fields.options) || {};

        const languageCode = 'en';

        switch (type) {
            case 'chips': {
                // const values = options || [];
                // let suggestionChips = [];
                // if (values.length) {
                //     suggestionChips = values.map(value =>
                //         value.structValue.fields.text.stringValue
                //     );
                // }
                let suggestionChips = options;
                const suggestionChipsContainer = document.createElement('div');
                outerBotMessageContainer.classList.add('removable');
                
                if (suggestionChips.length && !(customObj.response.displayName==='Session Feedback')) {
                    suggestionChipsFlag = true;
                    this._disableChatInput();
                    suggestionChips.forEach((chip) => {
                        const suggestionChip = document.createElement('button');
                        suggestionChip.innerText = chip;
                        suggestionChip.setAttribute('class', 'suggestion-chip');
                        suggestionChip.onclick = this._updateChipText(suggestionChip, suggestionChip.innerText);
                        suggestionChipsContainer.appendChild(suggestionChip);
                    });
                }
                if (suggestionChips.length && (customObj.response.displayName==='Session Feedback')) {
                    suggestionChipsFlag = true;
                    this._disableChatInput();
                    const starContainer = document.createElement('div')
                    starContainer.setAttribute('class', "star-container")
                    const starFeedback = document.createElement('div')
                    starFeedback.setAttribute("class", "star-feedback")
                    const starRating = document.createElement("div")
                    starRating.setAttribute("class", "star-rating")
                    starFeedback.appendChild(starRating)
                    starContainer.appendChild(starFeedback)

                    suggestionChips.forEach((chip) => {
                        const starIcon = document.createElement('input');
                        starIcon.innerText = chip;
                        starIcon.setAttribute("type", "radio")
                        starIcon.setAttribute("name", "rating")
                        starIcon.setAttribute("id", `rating-${starIcon.innerText}`)
                        starIcon.setAttribute('value',`${starIcon.innerText}`)
                        const starLabel = document.createElement("label")
                        starLabel.setAttribute("for",`rating-${starIcon.innerText}`)

                        starIcon.onclick = this._updateChipText(starIcon, starIcon.innerText);
                        // starIcon and starLabel are siblings within the starRating element
                        starRating.appendChild(starIcon);
                        starRating.appendChild(starLabel);
                        suggestionChipsContainer.appendChild(starContainer);
                        
                    }
                        
                    );
                }

                outerBotMessageContainer.appendChild(suggestionChipsContainer);
                multipleMessageContainer.appendChild(outerBotMessageContainer);
                if (isLastMsg) {
                    const timeDiv = document.createElement('div');
                    timeDiv.setAttribute('class', 'time-div');
                    timeDiv.innerHTML = getFormattedDateTime(new Date());
                    multipleMessageContainer.appendChild(timeDiv);
                }
                messagesContainer.appendChild(multipleMessageContainer);
                multipleMessageContainer.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
            }
                break;
            case 'autocomplete': {
                if (isLastMsg) {
                    const timeDiv = document.createElement('div');
                    timeDiv.setAttribute('class', 'time-div');
                    timeDiv.innerHTML = getFormattedDateTime(new Date());
                    multipleMessageContainer.appendChild(timeDiv);
                }
                messagesContainer.appendChild(multipleMessageContainer);
                multipleMessageContainer.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
            }
                break;

            case 'table':{
                console.log(options);
                // let options2= {
                //     "newListValue":{
                //         "newValues":[
                //             {
                //                 "newListValue":
                //                 [
                //                     "Amount ",
                //                     " ",
                //                     "100000 ",
                //                 ]
                //             },
                //             {
                //                 "newListValue":
                //                 [
                                   
                //                     "Maturity Amount ",
                //                     " ",
                //                     "128660 ",
                //                 ]
                //             },
                //             {
                //                 "newListValue":
                //                 [
                //                     "Tenure ",
                //                     " ",
                //                     "4 years ",
                //                 ]
                //             },

                //             {
                //             "newListValue":
                //             [
                //                 "ROI",
                //                 " ",
                //                 "6.35% "
                //             ]
                //         },
                //         {
                //             "newListValue":
                //             [
                //                 "Paying from ",
                //                 " ",
                //                 "xxxx 1234 "
                //             ]
                //         },
                //         {
                //             "newListValue":
                //             [
                //                 "Auto Renewal ",
                //                 " ",
                //                 "Yes "
                //             ]
                //         }
                                   
                //                 ]
                //             }
                        
                //     }
                
                // let options1= {
                //     "listValue":{
                //         "values":[
                //             {
                                
                //                 "listValue":
                //                 [

                //                         "Rate of Interest ",
                //                         " ",
                //                         "Tenure"
                //                 ]
                                        
                //             },
                //             {
                //                 "listValue":
                //                 [
                //                  "4.5%",
                //                  " ",
                //                  "390 Days"
                //                 ]   
                                
                //             },
                //             {
                //                 "listValue":
                //                 [
                //                  "5.35%",
                //                  " ",
                //                  "3 years"
                //                 ]   
                                
                //             },
                //             {
                //                 "listValue":
                //                 [
                //                  "6.35%",
                //                  " ",
                //                  "5 years"
                //                 ]   
                                
                //             },
                                    
                //         ]
                       
                //     }
                // }
                console.log(options);
                var _values = options[0].listValue.values;
                // var _newValues = options2.newListValue.newValues;
                console.log(_values);
                // console.log(_newValues);
                var hasHeader = fields.hasHeader;
        

                var rows = _values.map(function (value) {
                    // console.log(value);
                    return value.listValue;
                });

                // var newRows = _newValues.map((newValue)=>{
                //     return newValue.newListValue;
                // })
                console.log(rows.values);
                // console.log(newRows.values);
                var tableContainer = document.createElement('div');
                var newTableContainer = document.createElement('div');

            if (fields.headerText) {
            var msg = '';
            var length = fields.headerText.listValue.values.length - 1;
            // var newLength = fields.headerText.newListValue.newValues.length - 1;
            fields.headerText.listValue.values.forEach(function (
                value,
                i
            ) {
               msg +=
                length !== i
                  ? ''.concat(value.stringValue).concat(lineBreak)
                  : ''.concat(value.stringValue);   
            });

            // fields.headerText.newListValue.newValues.forEach((newValue , i) => {
            //     msg +=
            //     newLength !== i
            //       ? ''.concat(newValue.stringValue).concat(lineBreak)
            //       : ''.concat(newValue.stringValue);   
              

            // })


            this._insertBotMessages(
                msg,
                messagesContainer,
                false,
                multipleMessageContainer,
                customObj
            );  
        }

        let flag = 'apiVersion';
        if (flag !== 'downloadHistory') {
            var table = document.createElement('TABLE');
            // var newTable = document.createElement('NEW_TABLE');
            table.setAttribute('class','table');
            // newTable.setAttribute('class','table');
            var tBody =document.createElement('TBODY');
            // var newTBody = document.createElement('TBODY');
            table.appendChild(tBody);
            // newTable.appendChild(newTBody);
            tableContainer.appendChild(table);
            // newTableContainer.appendChild(newTable);
            // console.log(rows);
            _values.forEach(function (row,i){
                var tableRow = document.createElement('tr');
                if (hasHeader && i===0 ) { tableRow.setAttribute('class','header-row');} 
                else tableRow.setAttribute('class','table-row');
                if (!(hasHeader && i === 0) && i % 2 !== 0) {tableRow.classList.add('highlight-row');}
                console.log(row)
                row.listValue.forEach(function (col){
                    console.log(col);
                    var tableCol = document.createElement('td');
                    tableCol.setAttribute('class','table-col');
                    tableCol.innerText = col;
                    tableRow.appendChild(tableCol);
                });
                tBody.appendChild(tableRow);           
            });
            // _newValues.forEach(function (newRow,i){
            //     var newTableRow = document.createElement('tr');
            //     if (hasHeader && i===0 ) { newTableRow.setAttribute('class','header-row');} 
            //     else newTableRow.setAttribute('class','table-row');
            //     if (!(hasHeader && i === 0) && i % 2 !== 0) {newTableRow.classList.add('highlight-row');}
            //     console.log(newRow)
            //     newRow.newListValue.forEach(function (col){
            //         console.log(col);
            //         var newTableCol = document.createElement('td');
            //         newTableCol.setAttribute('class','table-col');
            //         newTableCol.innerText = col;
            //         newTableRow.appendChild(newTableCol);
            //     });
            //     newTBody.appendChild(newTableRow);           
            // });
            outerBotMessageContainer.appendChild(tableContainer);
            newOuterBotMessageContainer.appendChild(newTableContainer);
            multipleMessageContainer.appendChild(
                outerBotMessageContainer
            );
            multipleMessageContainer.appendChild(newOuterBotMessageContainer);

            if (isLastMsg) {
                var  _timeDiv = document.createElement('div');
                _timeDiv.setAttribute('class' , 'time-div');
                _timeDiv.innerHTML = getFormattedDateTime(new Date());
                multipleMessageContainer.appendChild(
                    outerBotMessageContainer
                );
                multipleMessageContainer.appendChild(newOuterBotMessageContainer);
                multipleMessageContainer.appendChild(_timeDiv);
                messageContainer.appendChild(multipleMessageContainer);
                multipleMessageContainer.scrollIntoView({
                    behavior:'smooth',
                    block:'start',
                    inline:'nearest'
                });
            }}
            else{
                customObj.isFirstMsg = 
                flag === 'downloadHistory' ? false : customObj.isFirstMsg;
                var _msg = '';
                var _length = rows.length - 1;
                var _newLength = newRows.length - 1;
               
                rows.forEach(function (row , i){
                    var colLen = row.length - 1;
                    row.forEach(function (col , j) {
                        _msg +=
                        colLen !== j
                        ? ''.concat(col.listValue, '\t')
                        :col.listValue;
                    });
                    _msg += _length !== i ?'\n' :'';
            
        });

        // newRows.forEach((newRow, i) => {
        //     var newColLen = newRow.length - 1;
        //     newRow.forEach((newCol , j) => {
        //         _newMsg += 
        //         newColLen !==j 
        //         ? ''.concat(newCol.newListValue , '\t'): newCol.newListValue;
        //     });
        //     _msg += _newLength !== i ?'\n' :'';

        // })
        this._insertBotMessages(_msg, messagesContainer,
            false,
            multipleMessageContainer,
            customObj
            );
        }
        if(fields.footerText){
            var _msg2 = '';
            var length2 = fields.footerText.listValue.values.length - 1;
            fields.footerText.listValue.values.forEach(function (
                value,
                i
            ) {
                msg2 += _length !==i
                ? ''.concat(value.stringValue).concat(lineBreak)
                : ''.concat(value.stringValue);
            });
            this._insertBotMessages(
             _msg,
             messagesContainer,
             false,
             ultipleMessageContainer,
             customObj   
            );
        }
        if(fields.footerText){
            var _msg2 = '';
            var _length2 = fields.footerText.listValue.values.length - 1;
            fields.footerText.listValue.values.forEach(function(
                value,
                i
            ) {
                _msg2 += 
                _length2 !== i
                ? ''.concat(value.stringValue).concat(lineBreak)
                : ''.concat(value.stringValue);
            });
            this._insertBotMessages(
                _msg2,
                messagesContainer,
                false,
                multipleMessageContainer,
                customObj
            );
        
        }
            }
            break;
            default: {
                console.log('did not recognize given custom response type!');
            }
                multipleMessageContainer.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
        }
        const chatWindow = shadow.shadowRoot.querySelector('.chat-window').getAttribute('opened');
        if (chatWindow !== 'true') setAccessibility(false);
    }

    _disableChatInput(){
        if(!disableTextFieldFlag) return;
        const chatInput = this.shadow.querySelector('.chat-input');
        chatInput.disabled = true;
        chatInput.style.opacity = 0.5;
    }

    _enableChatInput(){
        const chatInput = this.shadow.querySelector('.chat-input');
        chatInput.disabled = false;
        chatInput.style.opacity = 1;
        chatInput.select();
    }

    _refreshSession(shouldCloseWindow, triggerWelcome = true) {
        triggerWelcome = (typeof triggerWelcome === 'boolean') ? triggerWelcome : true;
        shouldCloseWindow = (typeof shouldCloseWindow === 'boolean') ? shouldCloseWindow : true;
        const languageCode = 'en';
        const welcomeMsg = this.languageMessageMap[languageCode].greetingMessage;
        this._removeAllMessageNodes(this.shadow.querySelector('.message-container'));
        shouldCloseWindow && openChatWindow();
        const downScroll = this.shadow.querySelector('.btn-animate-hover.scroll-down');
        downScroll.style.display = 'none';
        const chatInput = this.shadow.querySelector('.chat-input');
        chatInput.value = '';
        if (this.shadow.querySelector('.suggestion-dropdown')) {
            this.shadow.querySelector('.suggestion-dropdown').remove();
        }
        chatInput.removeEventListener('keyup', this._suggestAddress);
        chatInput.removeEventListener('keyup', this._suggestKeywords);
        triggerWelcome && this._webhookApi(welcomeMsg, true);
        this._enableChatInput();
    }

    _removeAllMessageNodes(parent) {
        while (parent.querySelector('.outer-user-message-container')) {
            parent.querySelector('.outer-user-message-container').remove();
        }
        while (parent.querySelector('.multiple-message-container')) {
            parent.querySelector('.multiple-message-container').remove();
        }
    }

    _attachInputEventListener(callback) {
        const chatInput = this.shadow.querySelector('.chat-input');
        chatInput.addEventListener('keyup', callback);
    }
}

customElements.define('shadow-demo', ShadowDemo);

function openChatWindow() {
    if (shadow && shadow.shadowRoot) {
        console.log('clicked open chat window')
        const wrapperContainer = shadow.shadowRoot.querySelector('.wrapper-container');
        wrapperContainer.style.display = 'none';
        const wrapper = shadow.shadowRoot.querySelector('.wrapper');
        const chatWindow = shadow.shadowRoot.querySelector('.chat-window');
        const qIcon = shadow.shadowRoot.querySelector('#q-icon');
        const closeIcon = shadow.shadowRoot.querySelector('#close-icon');
        const wrapperMsgContainer = shadow.shadowRoot.querySelector('.wrapper-msg-container');
        const chatInput = shadow.shadowRoot.querySelector('.chat-input');
        //when window opens, the scroll should be at bottom and the down button should not be displayed
        const downScroll = shadow.shadowRoot.querySelector('.btn-animate-hover.scroll-down');
        downScroll.style.display = 'none';
        const body = document.getElementsByTagName("BODY")[0];
        const html = document.getElementsByTagName("HTML")[0];

        if (chatWindow.getAttribute('opened') === 'false') {
            scrollAtBottom();
            if (isMobile.any()) {
                chatWindow.style.height = window.innerHeight;
            }
            chatWindow.setAttribute('opened', 'true');
            closeIcon.style.display = 'flex';
            qIcon.style.display = 'none';
            wrapper.className = 'wrapper expanded';
            wrapperMsgContainer.style.animation = 'fade 1s linear';
            wrapperMsgContainer.style.opacity = '0';
            wrapperMsgContainer.style.display = 'none';
            // startsession();
            if (getCookieValue('isflag') == "true") {
                startsession();
            }
            clearTimeout(idleTime);
            idleTime = setTimeout(() => {
                    confirmRefreshChat();
                    sessionExpiryCount++;
            }, sessionExpiryTime)
            document.cookie = "isflag" + '=' + false;
            setAccessibility(true);
            if (screen.width > "501") {
                chatInput.focus();
            }
            if (screen.width <= "501") {
                body.style.overflow = "hidden";
                html.style.overflow = "hidden";
            }
        } else {
            if (isMobile.any()) {
                chatWindow.style.height = '';
            }
            chatWindow.setAttribute('opened', 'false');
            qIcon.style.display = 'flex';
            qIcon.style.animation = 'spin 0.2s linear reverse';
            closeIcon.style.display = 'none';
            wrapper.className = 'wrapper';
            wrapperMsgContainer.style.opacity = '1';
            wrapperMsgContainer.style.display = 'flex';
            setAccessibility(false);
            if (screen.width <= "501") {
                body.style.overflowY = "auto";
                html.style.overflowY = "auto";
            }
            wrapperContainer.style.display = 'flex';
        }
    }
}

function getFormattedDateTime(date) {
    const options = {
        month: 'short',
        day: '2-digit',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    };
    return new Intl.DateTimeFormat('default', options).format(date);
}

function getCookieValue(name) {
    let expectedCookie;
    const cookies = (document.cookie && document.cookie.split(';')) || [];
    if (cookies.length) {
        let result = '';
        for (let i = 0; i < cookies.length; i++) {
            expectedCookie = cookies[i].trim().split('=');
            if (expectedCookie[0] == name) {
                result = expectedCookie[1];
                break;
            }
        }
        return result;
    } else if (localStorage.getItem(name)) {
        return localStorage.getItem(name);
    } else {
        return '';
    }
}

function setCookie(name, value, expireHours) {
    if (expireHours) {
        const date = new Date();
        date.setTime(date.getTime() + (expireHours * 3600 * 1000));
        const expires = 'expires=' + date.toUTCString();
        document.cookie = name + '=' + value + '; ' + expires;
    } else {
        document.cookie = name + '=' + value;
    }
    localStorage.setItem(name, value);
}

function removeBotMessageContainer(messagesContainer) {
    messagesContainer.querySelectorAll('.bot-loading-messages').forEach(e => e.remove());
    messagesContainer.querySelectorAll('.bot-message').forEach(e => e.remove());
}

function setAccessibility(isAccessible) {
    const selectorArray = ['.buttons-container', '#refresh-chat', '#minimize', 'a', '.chat-input'];
    selectorArray.forEach(selector => {
        const selectedElement = shadow.shadowRoot.querySelector(selector);
        if (selectedElement !== null) {
            (isAccessible) ? selectedElement.removeAttribute('tabIndex') : selectedElement.setAttribute('tabIndex', -1);
        }
    });

    const suggestionChipsArray = shadow.shadowRoot.querySelectorAll('.suggestion-chip');
    if (suggestionChipsArray.length > 0) {
        suggestionChipsArray.forEach(element => {
            (isAccessible) ? element.removeAttribute('tabIndex') : element.setAttribute('tabIndex', -1);
        });
    }

    if (!isAccessible && shadow.shadowRoot.activeElement) {
        shadow.shadowRoot.activeElement.blur();
    }
}

function closeOverlay(className = '.download-container', isModal = false) {
    console.log('close overlay')
    if (shadow && shadow.shadowRoot) {
        const wrapperContainer = shadow.shadowRoot.querySelector('.wrapper-container');
        wrapperContainer.style.display = 'flex';
        const downloadOverlay = shadow.shadowRoot.querySelector('.download-overlay');
        const container = shadow.shadowRoot.querySelector(className);
        container.style.animation = 'fadeOut 0.4s linear';
        container.style.opacity = '0';
        downloadOverlay.remove();
        setTimeout(function () {
            container.remove();
        }, 400);

        (isModal) ? setAccessibility(false) : setAccessibility(true);
    }
}

function disableRefreshButton(){
    const button = shadowDemoAC.getElementById('refresh-chat');
    button.disabled = true;
    button.style.opacity = 0.5;
}

function enableRefreshButton(){
    const button = shadowDemoAC.getElementById('refresh-chat');
    button.disabled = false;
    button.style.opacity = 1;
}

function confirmRefreshChatModal() {
    if (shadow && shadow.shadowRoot) {
        const chatWindow = shadow.shadowRoot.querySelector('.chat-window');
        const refreshChatOverlay = document.createElement('div');
        refreshChatOverlay.classList.add('download-overlay');
        refreshChatOverlay.style.animation = 'fadeIn 0.4s linear';
        refreshChatOverlay.style.opacity = '0.5';
        const refreshChatConfirm = document.createElement('div');
        refreshChatConfirm.classList.add('download-container', 'flex-center');
        const languageCode = 'en';
        const refreshChatText = languageMessageMap[languageCode].refreshChatText;
        const refreshChatConfirmBtn = languageMessageMap[languageCode].refreshChatConfirmBtn;
        setAccessibility(false);

        refreshChatConfirm.innerHTML =
            `<div class="confirm-container"><div class="confirm-txt">${refreshChatText}</div></div>\
      <div class="flex-center"><span onclick="refreshChat()"><button class="download-btn">${refreshChatConfirmBtn}</button></a></div></div><button class="close-btn-container btn-animate-hover" onclick="closeOverlay()"><img class="close-btn-overlay" alt="close modal" src=` + storageUrl + `close-black.svg></button>`;
        chatWindow.appendChild(refreshChatOverlay);
        chatWindow.appendChild(refreshChatConfirm);
    }
}

function webhookApiFailed() {
    if (shadow && shadow.shadowRoot) {

        const chatWindow = shadow.shadowRoot.querySelector('.chat-window');
        const errorMsgOverlay = document.createElement('div');
        errorMsgOverlay.classList.add('download-overlay');
        errorMsgOverlay.style.animation = 'fadeIn 0.4s linear';
        errorMsgOverlay.style.opacity = '0.5';
        const errorMsgConfirm = document.createElement('div');
        errorMsgConfirm.classList.add('download-container', 'flex-center');
        const languageCode = 'en';
        const webhookApiFailedText = languageMessageMap[languageCode].webhookApiFailedText;
        const webhookApiFailedBtn = languageMessageMap[languageCode].webhookApiFailedBtn;
        setAccessibility(false);

        errorMsgConfirm.innerHTML =
            `<div class="confirm-container"><div class="confirm-txt">${webhookApiFailedText}</div>\
        <div class="flex-center"><span onclick="closeOverlay()"><button class="download-btn">${webhookApiFailedBtn}</button></a></div></div></div><button class="close-btn-container btn-animate-hover" onclick="closeOverlay()"><img class="close-btn-overlay" alt="close modal" src=` + storageUrl + `close-black.svg></button>`;
        chatWindow.appendChild(errorMsgOverlay);
        chatWindow.appendChild(errorMsgConfirm);
    }
}

function confirmRefreshChat(delay = 0) {
    const renderConfirmContainer = () => {
        if (shadow && shadow.shadowRoot) {
            const chatWindow = shadow.shadowRoot.querySelector('.chat-window');
            const refreshChatOverlay = document.createElement('div');
            refreshChatOverlay.classList.add('download-overlay');
            refreshChatOverlay.style.animation = 'fadeIn 0.4s linear';
            refreshChatOverlay.style.opacity = '0.5';
            const refreshChatConfirm = document.createElement('div');
            refreshChatConfirm.classList.add('download-container', 'flex-center');
            const languageCode = 'en';
            const sessionEndText = languageMessageMap[languageCode].sessionEndText;
            const refreshChatConfirmBtn = languageMessageMap[languageCode].refreshChatConfirmBtn;
            setAccessibility(false);

            refreshChatConfirm.innerHTML =
                `<div class="confirm-container"><div class="confirm-txt">${sessionEndText}</div></div>\
          <div class="flex-center"><span onclick="refreshChat()"><button class="download-btn">${refreshChatConfirmBtn}</button></a></div></div>`;
            chatWindow.appendChild(refreshChatOverlay);
            chatWindow.appendChild(refreshChatConfirm);
        }
    };

    if (delay) {
        setTimeout(renderConfirmContainer, delay)
    } else {
        renderConfirmContainer()
    }
}

function refreshChat() {
    if (shadow && shadow.shadowRoot) {
        disableRefreshButton();
        closeOverlay();
        shadow._refreshSession(false);
        stopAutocomplete();
    }
}

function startsession() {
    if (shadow && shadow.shadowRoot) {
        shadow._refreshSession(false);
    }
}

function scrollAtBottom() {
    const shadowDemo = document.querySelector('#shadow').shadowRoot;
    const messageContainer = shadowDemo.querySelector('.message-container');
    setTimeout(() => {
        messageContainer.scrollTop = messageContainer.scrollHeight;
    }, 0)
}

function preventScroll(e) {
    const delta = (e.type === "mousewheel") ? e.wheelDelta : e.detail * -40;
    if (delta < 0 && (this.scrollHeight - this.offsetHeight - this.scrollTop) <= 1) {
        this.scrollAtTop = this.scrollHeight;
        e.preventDefault();
    } else if (delta > 0 && delta > this.scrollTop) {
        this.scrollTop = 0;
        e.preventDefault();
    }
}
const messageContainer = document.querySelector('#shadow').shadowRoot.querySelector('.message-container');
messageContainer.addEventListener("mousewheel", preventScroll);
messageContainer.addEventListener("DOMMouseScroll", preventScroll);

const isMobile = {
    Android: function () {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function () {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function () {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function () {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function () {
        return navigator.userAgent.match(/IEMobile/i);
    },
    any: function () {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};

// this function runs when the DOM is ready, i.e. when the document has been parsed
document.addEventListener('DOMContentLoaded', function () {
    const shadowDemo = document.querySelector('#shadow').shadowRoot;
    const messageContainer = shadowDemo.querySelector('.message-container');
    const chatTitle = shadowDemo.querySelector('.chat-title');
    const downScroll = shadowDemo.querySelector('.btn-animate-hover.scroll-down');
    let scrollLocked = false;
    let lastCall = false;
    messageContainer.addEventListener('scroll', function scrollCallback() {
        if (scrollLocked) return;

        if (lastCall) clearTimeout(lastCall)

        lastCall = setTimeout(() => {
            if (messageContainer.scrollTop > 10) {
                chatTitle.classList.add('scrollGradient');
            } else {
                chatTitle.classList.remove('scrollGradient');
            }
            if ((messageContainer.scrollTop + messageContainer.offsetHeight) >= (messageContainer.scrollHeight - 2.3)) {
                downScroll.style.display = 'none';
            } else {
                downScroll.style.display = 'flex';
            }
            if (messageContainer.scrollTop === 0 && messageContainer.offsetHeight === 0) {
                downScroll.style.display = 'none';
            }
        }, 300)
    }, { passive: true });
});


// auto complete starts

// start auto complete functionality by adding input event listener
function startAutocomplete() {
    const chatInput = shadowDemoAC.querySelector('.chat-input');
    chatInput.addEventListener("input", autocompleteEventListener);
    chatInput.addEventListener("keydown",autocompleteKeydownEventListener);
}

// stop auto complete functionality by removing input event listener
function stopAutocomplete() {
    const chatInput = shadowDemoAC.querySelector('.chat-input');
    chatInput.removeEventListener("input", autocompleteEventListener);
    chatInput.removeEventListener("keydown",autocompleteKeydownEventListener )
    closeAutocompleteList();
}

// execute a function on user input
function autocompleteEventListener() {

    //close any already open lists of autocompleted values
    closeAutocompleteList();

    let val = this.value.trim();
    if (!val || val.length <= 3) { return false; }

    const filteredData = autocompleteData.filter(value => value.toLowerCase().includes(val.toLowerCase()));

    // limiting autocomplete count to max 300
    if(filteredData && filteredData.length>300) filteredData.length= 300;

    let autocompleteDiv = shadowDemoAC.querySelector('.autocomplete');
    if (!autocompleteDiv) {
        autocompleteDiv = document.createElement("div");
        autocompleteDiv.setAttribute("class", "autocomplete");
        autocompleteDiv.setAttribute("id", "autocomplete");
        
    }

    const chatFooter = shadowDemoAC.querySelector('.chat-footer');
    const chatInput = shadowDemoAC.querySelector('.chat-input');
    chatFooter.insertBefore(autocompleteDiv, chatInput);

    // filter matching items from auto complete data and create elements for same
    for (var i = 0; i < filteredData.length; i++) {
        let arrValue = filteredData[i];
        let itemDiv = document.createElement("div");
        let valIndex = arrValue.toLowerCase().indexOf(val.toLowerCase());
        itemDiv.innerHTML = arrValue.substring(0, valIndex) + "<span class='highlight'>" + arrValue.substring(valIndex, valIndex + val.length) + "</span>" + arrValue.substring(valIndex + val.length);
        itemDiv.setAttribute("class", 'autocomplete-items');
        

        // hidden Input to retrive selected item value
        let hiddenInput = document.createElement("input");
        hiddenInput.setAttribute("type", "hidden");
        hiddenInput.setAttribute("value", filteredData[i]);
        hiddenInput.setAttribute("class", "input");
        itemDiv.appendChild(hiddenInput);
        
        // execute a function when someone clicks on the item value
        itemDiv.addEventListener("click", function (e) {

            // insert the value for the autocomplete text field
            const chatInput = shadowDemoAC.querySelector('.chat-input');
            chatInput.value = e.currentTarget.querySelector("input").value;
            // close the list of autocompleted values
            closeAutocompleteList();

            // send message to dialog flow
            shadow._sendMessage();
        });
        autocompleteDiv.appendChild(itemDiv);

        // get dynamic height of autocomplete div to set dynamic margin bottom
        let height = window.getComputedStyle(autocompleteDiv).height.replace('px', '');
        autocompleteDiv.style.marginBottom = parseInt(height) + 45 + "px";
        
    }

    // classify first item as "active"
    let autocompleteRef = autocompleteDiv.getElementsByTagName("div");
    if(autocompleteRef.length > 0) {
        currentFocus = 0;
        addActive(autocompleteRef);
    }

    // remove auto complete div if no child nodes
    if (autocompleteDiv.childNodes.length == 0) closeAutocompleteList();
}

// closing autocomplete suggestions
function closeAutocompleteList() {
    const autocompleteList = shadowDemoAC.querySelector('.autocomplete');
    if (autocompleteList) autocompleteList.remove();
}


// execute a function when key pressed on the keyboard
function autocompleteKeydownEventListener(e) {
    let autocompleteRef = shadowDemoAC.querySelector('.autocomplete');
    if (autocompleteRef) autocompleteRef = autocompleteRef.getElementsByTagName("div");

    if (e.keyCode == 40 &&
        !(
          currentFocus ===
          shadowDemoAC.getElementById('autocomplete').children.length - 1
        )) {
    //   If the arrow DOWN key is pressed, increase the currentFocus variable
            let scrollView = shadowDemoAC.querySelector(".autocomplete-items.item-focused")
            scrollView.scrollIntoView()
        // shadowDemoAC.getElementById('autocomplete').scrollTop = shadowDemoAC.getElementById('autocomplete').scrollTop + shadowDemoAC.querySelector(".autocomplete-items.item-focused").offsetHeight;
        currentFocus++;
        addActive(autocompleteRef);
    } else if (e.keyCode == 38 && currentFocus) { //up
    //   If the arrow UP key is pressed, decrease the currentFocus variable
        currentFocus--;
        addActive(autocompleteRef);
        let scrollView = shadowDemoAC.querySelector(".autocomplete-items.item-focused")
        scrollView.scrollIntoView() 
        // shadowDemoAC.getElementById('autocomplete').scrollTop = shadowDemoAC.getElementById('autocomplete').scrollTop - shadowDemoAC.querySelector(".autocomplete-items.item-focused").offsetHeight;
    } else if (e.keyCode == 13) {
    // If the ENTER key is pressed, prevent the form from being submitted, and simulate a click on the "item-focused (active)" item
        e.preventDefault();
        if (currentFocus > -1) {
            if (autocompleteRef) autocompleteRef[currentFocus].click();
        }
    }
}

// function to classify an item as "active"
function addActive(autocompleteRef) {
    if (!autocompleteRef) return false;
    // start by removing the "item-focused" class on all items
    removeActive(autocompleteRef);
    if (currentFocus >= autocompleteRef.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (autocompleteRef.length - 1);
    
    // add class "item-focused"
    autocompleteRef[currentFocus].classList.add("item-focused");
}

// function to remove the "item-focused" class from all autocomplete items
function removeActive(autocompleteRef) {
    for (var i = 0; i < autocompleteRef.length; i++) {
        autocompleteRef[i].classList.remove("item-focused");
    }
}


//auto complete (AC) shadow demo reference   
const shadowDemoAC = document.querySelector('#shadow').shadowRoot;

// auto complete - array data
let autocompleteData = [];

let currentFocus;   

// auto complete ends