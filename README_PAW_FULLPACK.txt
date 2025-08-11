Project.PAW FULL PACK (SOCIAL LOGIN BUILD)
- Core pages: index.html, project_list.html, project.html, create.html
- Styles/JS: style.css, main.js, create.js
- Social login: login.html (Google/Kakao/Naver), naver_callback.html
- Assets: images/login_cat2.jpg (placeholder)

Admin mode (local only):
- Click the gear button at bottom-right. Stored in localStorage 'paw_admin'.

Deploy:
1) Upload all files to repo root (index.html at top level)
2) GitHub Pages → hard refresh after deploy
3) Ensure OAuth callback URLs match your domain

V7 Share-Ready:
- /data/projects.json에 프로젝트를 넣고 푸시하면, GitHub Actions가 자동으로:
  1) /p/{id}.html (OG 태그 포함, 봇용) 생성
  2) /share/{id}.png (1200x630) 공유 이미지 생성
- 앱 내부 링크는 /p/{id}.html로 향하고, 사람은 즉시 project.html?id={id}로 리다이렉트됩니다.
- Admin 설정에 '프로젝트 JSON 내보내기' 버튼 추가 → 이 파일을 /data/projects.json로 커밋하세요.
