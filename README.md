# 실행하는법 오버뷰 

#### 들어가기에 앞서
Project는 랜딩페이지, Technical product (Core 기능 있음), Launching page(Core 기능 있음)  -> 참고로 전부 pulsedotsol.com으로 들어가면 볼 수 있다. 

총 3개인데, 성과물로 볼만한 것은 Launching Page이므로 (왜냐하면 실제로 런칭을 하고 반응을 봐왔고, 보았음. 추가적으로 기말발표 때 '직접' 시연한 부분이기도 함.  
+ 코어 기능이 복잡하지 않고 Viral에 특화되어있음. - 코어 기능은 0. 지갑 연동 하고 게시물 쓰기 1. 트위터 intent를 통한 자동 리포스팅 2. 타이머 리로딩을 통한 게이미피케이션) 


### git clone
작업 폴더를 하나 만들고, 
그 안에서 git clone `?`
그리고 `cd Pulse-Launch`

## 실행 방법

### 1. Phantom wallet 설치 

#### (1) Chrome
[Phantom wallet](https://phantom.com/) 이 링크로 들어가서 

![image](https://github.com/user-attachments/assets/5a439ef7-a8e5-447c-a6ff-8a51f63e0d84)

다운로드 버튼을 누르면 어떤 브라우저 용으로 깔지가 나온다. 

그 다음에  Chrome을 선택하고 

![image](https://github.com/user-attachments/assets/64be178d-97b6-4dee-9aa5-3300f80033e9)
해당 부분을 눌러서 설치한다. 

자 이제 `새 월릿 생성`을 선택한다. 

![image](https://github.com/user-attachments/assets/29b2ed99-a159-40c5-b7b9-a670a9a4b324)

그 후,

`시드 문구 월릿 만들기` 를 선택한다. 

![image](https://github.com/user-attachments/assets/cf8bc849-b6f2-4974-8fdd-373ad02511bb)

그리고 나서 기억할 수 있는 비밀번호를 선택하여 입력한다. (주의: 기억할 수 있어야함!)

![image](https://github.com/user-attachments/assets/bc4c5d63-cc96-4857-811f-c84f8332b3c6)

시드 문구(복구용 문구)를 백업해놓는다. (다만, 자산이 걸린 일이라, 추후에 있을 위험에 대비하여 공책에 적어놓는 것을 추천한다.) 
![image](https://github.com/user-attachments/assets/a20bf42e-3c47-4327-afe5-eb5ef7552aa2)

이러면 Wallet 설치가 끝났다! 

#### (2) MS Edge, Firefox 등 
[Phantom wallet](https://phantom.com/) 

나머지 브라우저들도 크게 다른거는 없으나, 각 브라우저에 맞는 익스텐션을 잘 골라서 설치해야한다.
![image](https://github.com/user-attachments/assets/42306fb8-4804-4c66-ac42-c59989ac08e7)


### 2. NVM 설치 및 Node 23.9.0 적용 

### (1) Window ver.

Window에서는, 우선 다음 사이트로 접속한다. 
[다운로드 사이트](https://github.com/coreybutler/nvm-windows/releases)

접속을 하면 다음과 같은 화면이 뜬다. 

여기서, `nvm-setup.exe`를 선택하자. 

![image](https://github.com/user-attachments/assets/f91a4115-5c69-42b1-acfc-8cf303ea2ad0)

설치하고 나서 실행하고 

![image](https://github.com/user-attachments/assets/8c954589-e913-49aa-a3c5-bc61ffba3326)

전부 다 Next. 

이것도 다 디폴트로 설정해놓고 Next

![image](https://github.com/user-attachments/assets/4e2334b2-10bb-4063-acd8-f53b8fb2441b)

깔렸는지 확인하고, nvm -v가 안 먹히면 터미널 껐다 키기도 방법.

![image](https://github.com/user-attachments/assets/4e9f5a9c-2e8c-4d28-885e-cf62b091823c)

그리고 나서 cmd를 열어서, git clone을 받은 폴더에서, 
`nvm install 23.9.0`를 수행한다. 
그 후, 
`nvm use 23.9.0`을 수행한다. (이 때, 권한 요청이 나올텐데, 예를 누르면 된다.) 

![image](https://github.com/user-attachments/assets/511a0413-0fc6-43cc-9042-703ed2e86f2e)

이렇게 node v23.9.0 이 적용된다! (확인은 `node -v`)


### (2) Linux ver(Ubuntu).

`sudo apt update` 를 통해서 패키지를 최신 상태로 업데이트 한 뒤, 
`sudo apt install -y curl build-essential libssl-dev` 를 통해 필요한 필수 컴파일러등을 설치한다. 

주의: Snap으로 설치된 curl이나 git-core가 충돌을 일으킬 수 있으므로, 문제가 발생하면 `sudo snap remove curl` 후 `sudo apt install curl git-core`로 다시 설치

그리고 이제 본격적으로 NVM 설치에 들어간다. 
`curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.39.0/install.sh | bash` -> 공식 설치 스크립트. 

이후
`source ~/.bashrc` 를 실행시켜, 터미널을 소싱하여, 환경변수를 설정한다.

설치 확인: `command -v nvm`

이후  git clone을 받은 폴더에서, 
`nvm install 23.9.0`를 수행한다. 
그 후, 
`nvm use 23.9.0`을 수행한다.

이후 확인은 `node -v`


### (3) Mac ver

`xcode-select --install` 를 통해 CLT를 설치 한 뒤, 
`/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"` 를 통해 homebrew를 설치한다. 

그리고 이제 본격적으로 NVM 설치에 들어간다. 
`curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash` -> 공식 설치 스크립트. 

이후
Zsh를 사용 중이라면 ~/.zshrc에, Bash라면 ~/.bashrc나 ~/.bash_profile에 다음 줄이 자동으로 추가됐는지 확인(`/Users/<사용자이름>/.zshrc`에 있으므로, `/Users/<사용자이름>` 에서 편집기를 열어서 확인. ) - 만일 오류가 날 시 해당 사항이 비어있을 확률이 있어서, 오류가 난다면 수동으로 추가한다.

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
 
이후 쉘 로드 
`source ~/.zshrc`


설치 확인: `command -v nvm`

이후  git clone을 받은 폴더에서, 
`nvm install 23.9.0`를 수행한다. 
그 후, 
`nvm use 23.9.0`을 수행한다.

이후 확인은 `node -v`


### 3. Next.js 실행하기 
