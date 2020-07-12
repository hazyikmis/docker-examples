# Use an existing docker image as a base
FROM alpine

# Download and install a dependency
# The command after RUN, nothing related to docker, its an alpine command
RUN apk add --update redis

# Tell the image what to do when it starts as a container
CMD ["redis-server"]
