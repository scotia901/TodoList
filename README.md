# TodoList

# 소개
* MS To do 윈도우 앱을 참조하여 To do 웹 어플리케이션을 만들었습니다.
* AWS에서 구동시켰습니다.
* 데모 사이트 : https://scotia901-jeonghwan.com/

# 기술 스택
* FrontEnd
    * PUG
    * CSS
    * JavaScript
* BackEnd
    * Node.js
    * MySQL

# 주요 기능
1. 카테고리
    * 미완료 Todo 숫자 표시
    * 배경색 설정, 생성, 삭제, 이름 변경
    * 기본 카테고리 : 회원 가입시 생성되는 카테고리
        * 작업 : 개인 카테고리 이외의 Todo 표시
        * 계획된 일정 : 마감기한이 남은 넘지 않은 모든 Todo 표시
        * 중요 : 중요도가 설정된 모든 Todo 표시
        * 오늘 할 일 : 마감기한이 오늘인 모든 Todo 표시
    * 개인 카테고리
        * 생성 및 삭제
        * 이름 수정

2. Todo
    * 생성 및 삭제
    * 완료됨, 중요도, 마감기한 설정
    * 내용 수정
    * 순서 정렬

3. 회원
    * 회원가입 및 탈퇴
    * SNS 연동 및 해제
    * 아이디, 비밀번호 찾기
    * 기본 프로필 이미지 추가
    * 프로필 이미지 수정 및 삭제
    * 이메일, 별명, 비밀번호 변경

4. 보안
   * Prevnet brute force attack
   * Prevnet SQL injection attack
   * Prevent Cross-Site Scripting
   * Prevent Cross-Site Request Forgery

# 실행 화면
1. 로그인 화면
   * 회원 가입
   * 아이디 및 비밀번호 찾기
3. 메인 화면
   * Todo 생성후 화면
   * 정렬 전후 화면
   * 완료 및 데드라인 화면
   * 새로운 카테고리 화면
5. 프로필 화면
   * 프로필 사진 변경
   * 비밀번호 변경
   * 이메일 변경
   * 별명 변경
   * 탈퇴
7. 인증
   * 회원가입, 비밀번호 변경을 하기위하 이메일 인증화면을 보여준다.
