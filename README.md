docker run hello-world
docker run busybox echo hi there
docker run busybox echo ls
docker run busybox echo sh
docker run busybox ping google.com
docker run = docker create <imgname> + docker start -it <imgname>
docker start 859276a0c
docker start -it 859276a0c ls
docker stop 859276a0c

docker ps
docker ps -all

docker system prune
