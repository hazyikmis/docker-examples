## DOCKER

# Some basic commands

- docker create hello-world
- docker start -a 55464656

- docker run hello-world
- docker run busybox echo hi there
- docker run busybox ls
- docker run -it busybox sh
- docker run busybox ping google.com
- docker run = docker create <imgname> + docker start -a <containerid>
- docker start -a 859276a0c
- docker stop 859276a0c

- docker exec -it 859276a0c redis-cli
- docker exec -i -t 859276a0c redis-cli
- docker exec -it 859276a0c sh

- docker logs 859276a0c

- docker ps
- docker ps -all

- docker system prune

- docker build .

(after the image created)

- docker run a2d2b488a16c

When building new images, its better to tag in order not to
use always IDs:

- docker build -t hazyikmis/nodesimpleapp .

- docker build -t hazyikmis/redis:latest .
- docker build -t hazyikmis/posts:0.0.1 .
- docker build -t hazyikmis/posts .

# Creating new image from a running container

1. first, run an image with a shell (to install something...)
   > docker run -it alpine sh
2. with this command you are on the shell inside the docker container you just run. Install redis, or any other pack
   > /# apk add --update redis
3. leave this shell open (container running), open another shell, and execute ps command to list all running containers, find your newly run alpine container, use its id

   > docker ps

   > docker commit -c 'CMD ["redis-server"]' <containerid>

4. vollia, your new image created and its id shown. You can use it, run it....
   > docker run 345353535

# Port mapping

There's no limitation by default on your containers ability to reach out. It's strictly a limitation on the ability for incoming traffic to get in to the container. So in order to set up this mapping in order to kind of forward this traffic to a specific port inside the container we're going to make a slight adjustment to the way in which we start the container up or specifically the docker run command. So this is not a change that we're going to make to the docker file. We do not setup port forwarding inside the docker file the port forwarding stuff is strictly a runtime constraint. In other words it's something that we only change when we run a container or start a container up. So here's what we're gonna do to setup Docker run with port mapping.

> docker run -p 8080:8080 hazyikmis/nodesimpleapp

In order to connect the container and execute some commands inside the docker

> docker run -it hazyikmis/nodesimpleapp sh

(But this creates another container from the same image. In order to connect exact same container:)

> docker exec -it <containerId> sh

# Check the COMMENTS inside the file:

![/nodejs-app/Dockerfile](./nodejs-app/Dockerfile)

## KUBERNETES (K8s)

(For K8s example pod & deployment file examples check the 01-blog-app/infra/k8s/posts.yaml & posts-depl.yaml)

- To process a K8s config file, (meaning to run pods/containers):

> kubectl apply -f posts.yaml

> kubectl get pods

- Running a command in the containers of the pods,
- If you have more than one containers in pods then, it will be asked to run this command in which container.

> kubectl exec -it posts sh

> kubectl logs posts

- Very important, to see all config options & all events on the pod:

> kubectl describe pod posts

> kubectl apply -f posts-depl.yaml

> kubectl get deployments

- If you delete a pod, defined inside a deployment, another pod automatically created instantly

> kubectl delete pod posts-depl-74ddc57b7c-pcbh2

> kubectl get pods

> kubectl describe deployment posts-depl

> kubectl delete deployment posts-depl

- Pushing up your images to docker hub

> docker login -u hazyikmis

> docker push hazyikmis/posts

- To process a K8s config file, (meaning to run pods/containers - pulling the latest version from docker hub):

> kubectl rollout restart deployment posts-depl

# NodePort service: Makes a pod accessible from outside the cluster

Usually only used for dev purposes.

- Check the the file posts-srv.yaml

> kubectl apply -f posts-srv.yaml

- To list all running services

> kubectl get services

- To see all config options (especially port numbers) about a service:

> kubectl describe service posts-srv

- Randomly assigned "NodePort" info of the NodePort service shows that how we can access the app (which port we should use? Lets assume that NodePort is 32211 assigned)

> http://localhost:32211/posts

# Cluster IP Service

- To communicate containers inside the pods

> docker build -t hazyikmis/event-bus .

> docker push hazyikmis/event-bus

- create "event-bus-depl.yaml" under the infra/k8s
- go to infra/k8s directory

> kubectl apply -f event-bus-depl.yaml

- make sure all pods active

> kubectl get pods

- NAME READY STATUS RESTARTS AGE
- event-bus-depl-5879466c4b-w7vb6 1/1 Running 0 34s
- posts-depl-6f5dbdfb85-rsz88 1/1 Running 0 2d13h

- Now we know that there is no comm between these pods
- bacause localhost:400X addressing not works. Thats where we need Cluster IP Service. We need to create Cluster IP Services for each app
- We can create these new services by defining them inside the existing deployment config files or we cqn create new config file. Totally up to us
- after adding new Cluster IP service config (named event-bus-srv) just inside the event-bus-depl.yaml, we should apply again this config file

> kubectl apply -f event-bus-depl.yaml

- deployment.apps/event-bus-depl unchanged
- service/event-bus-srv created

> kubectl get services

- NAME TYPE CLUSTER-IP EXTERNAL-IP PORT(S) AGE
- event-bus-srv ClusterIP 10.108.162.64 <none> 4005/TCP 2m39s
- kubernetes ClusterIP 10.96.0.1 <none> 443/TCP 5d12h
- posts-srv NodePort 10.100.61.158 <none> 4000:32211/TCP 2d13h

- repeat this same process for posts service. But first we must change the name of the NodePort service from event-bus-srv to event-bus-clusterip-srv

> kubectl delete service event-bus-srv

- change the name of the service

> kubectl apply -f event-bus-depl.yaml

- Then add another service inside the posts-depl.yaml for posts-clusterip-srv-

> kubectl apply -f posts-depl.yaml

> kubectl get services

- NAME TYPE CLUSTER-IP EXTERNAL-IP PORT(S) AGE
- event-bus-clusterip-srv ClusterIP 10.106.42.173 <none> 4005/TCP 3m10s
- kubernetes ClusterIP 10.96.0.1 <none> 443/TCP 5d12h
- posts-clusterip-srv ClusterIP 10.101.195.19 <none> 4000/TCP 3s
- posts-srv NodePort 10.100.61.158 <none> 4000:32211/TCP 2d13h

- NOW HOW TO COMMUNICATE event-bus & posts. Should be wired!
- Make changes in the event-posts & posts apps. In both of the index.js files
- we should replace "http://localhost:4000/events" to "http://posts-clusterip-srv:4000/events" in event-bus/index.js
- and "http://localhost:4005/events" to "http://event-bus-clusterip-srv:4005/events" in posts/index.js
- then we should rebuild the images, upload/push them to docker hub then run the "kubectl rollout restart deployment <deplname>" command
- inside the event-bus directory

> docker build -t hazyikmis/event-bus .

> docker push hazyikmis/event-bus

- inside the posts directory

> docker build -t hazyikmis/posts .

> docker push hazyikmis/posts

- Then check out the existing/running deployments

> kubectl get deployments

- NAME READY UP-TO-DATE AVAILABLE AGE
- event-bus-depl 1/1 1 1 51m
- posts-depl 1/1 1 1 2d15h

- no need to change directorate, you can execute the commands below wherever you want

> kubectl rollout restart deployment posts-depl

> kubectl rollout restart deployment event-bus-depl

- Then, in order to being sure of all pods restarted

> kubectl get pods

- NAME READY STATUS RESTARTS AGE
- event-bus-depl-88888994f-n7gr2 1/1 Running 0 48s
- posts-depl-7bf8b4cfc4-68cdq 1/1 Running 0 60s

- NOW WE CAN TEST BY USING POSTMAN OR VSCODE EXTENSION "REST Client" USING "api.rest" file
- Rather than sending POST request to "http://localhost:4000/posts" to create a post, we need to send POST request to "NodePort" service of posts app which is named "posts-srv" with the port no "32211". You should check the IP by the command "docker get services"
- POST http://localhost:32211/posts
- After posting something lest check the logs of pods

> kubectl get pods

- NAME READY STATUS RESTARTS AGE
- event-bus-depl-88888994f-n7gr2 1/1 Running 0 15m
- posts-depl-7bf8b4cfc4-68cdq 1/1 Running 0 15m

> kubectl logs posts-depl-7bf8b4cfc4-68cdq

- //Received event: PostCreated

- AFTER changing comments, moderation and query apps, then their docker images created, pushed to docker hub, and then their deployment config files created. In order to run these deployments files all together with one command:

> kubectl apply -f .

- NOW, Last changes on the event-bus/index.js done, all API addresses updated according to dockerized services:

> kubectl get services

- NAME TYPE CLUSTER-IP EXTERNAL-IP PORT(S) AGE
- comments-clusterip-srv ClusterIP 10.104.191.232 <none> 4001/TCP 8m26s
- event-bus-clusterip-srv ClusterIP 10.106.42.173 <none> 4005/TCP 3h38m
- kubernetes ClusterIP 10.96.0.1 <none> 443/TCP 5d16h
- moderation-clusterip-srv ClusterIP 10.102.116.248 <none> 4003/TCP 8m5s
- posts-clusterip-srv ClusterIP 10.101.195.19 <none> 4000/TCP 3h35m
- posts-srv NodePort 10.100.61.158 <none> 4000:32211/TCP 2d16h
- query-clusterip-srv ClusterIP 10.106.12.120 <none> 4002/TCP 7m56s

> docker build -t hazyikmis/event-bus .

> docker push hazyikmis/event-bus

> kubectl rollout restart deployment event-bus-depl

## LOAD BALANCER & INGRESS CONTROLLER SERVICES

https://kubernetes.github.io/ingress-nginx/deploy/

kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v0.34.1/deploy/static/provider/cloud/deploy.yaml

- ingress-srv.yaml created under "infra/k8s"

> kubectl apply -f ingress-srv.yaml

- we have defined as "host: posts.com" for our app, but for deployment purposes, we need to trick that "localhost" means "posts.com" using "etc/hosts". If you try to connect posts.com, do not, just go to localhost. For windows C:\Windows\System32\Drivers\etc\hosts. For MacOS/Linux /etc/hosts.
- The line below added to the hosts file
- 127.0.0.1 posts.com

- In the client folder, where our react app resides, we have replaced all "http://localhosts/xxx" to "http://posts.com/xxx". (in the js files under /src folder)

- Then

> docker build -t hazyikmis/client .

> docker push hazyikmis/client

- Then, we need another deployment config file for our client react app. Under infra/k8s, we have created "client-depl.yaml"

> kubectl apply -f client-depl.yaml

- Now, we need to re-arrange ingress-srv.yaml to allow all communication between pods
- But we have a problem; "POST /posts" and "GET /posts" have the same route, but the first creates a post and needs to access "Posts" pod, the second list posts and needs to access "Query" pod. Because of this situation we need to define the routes more clearly; For example, in order to create a new post, rather than using "/posts" route, its better to use "/posts/create". We have done these changes on the client/src/PostCreate.js & posts/index.js
- After these changes

> docker build -t hazyikmis/client .

> docker push hazyikmis/client

> kubectl rollout restart deployment client-depl

> docker build -t hazyikmis/posts .

> docker push hazyikmis/posts

> kubectl rollout restart deployment posts-depl

- Now we have unique routes
- We need to add other services to the ingress-srv.yaml
- After adding them we need to apply all changes done in the ingress-depl.yaml

> kubectl apply -f ingress-srv.yaml

## SKAFFOLD

- First install choco: https://chocolatey.org/
- Then install skaffold: https://skaffold.dev/
- check the skaffold is properly installed, type skaffold on the shell

- Now, its time to write another config file for skaffold, under the root of blog-app
- skaffold.yaml

> skaffold dev

- At first run, a tons of errors/warnings, thats ok, run it again
- Then, from that moment, its very easy to change anything in one of your apps
- skaffold automatically pushes this change to the related pod/container
- and this is beautiful. Another beautiful thing is, if you CTRL+C and kill the skaffold
- then all services, deployments and pods gone, super/hiper !!!
- NOTE: after CTRL+C, check with

> kubectl get deployments/services/posts

- If all still stands then;

> skaffold delete
