# Base image
FROM ubuntu:22.04

# Install bash, core utilities, sudo, and basic tools
RUN apt-get update && \
    apt-get install -y \
    bash \
    sudo \
    curl \
    vim \
    net-tools \
    iputils-ping \
    git \
    openssh-client \
    less \
    python3 \
    python3-pip \
    && apt-get clean

# Create a non-root user
ARG USERNAME=student
ARG USER_UID=1001
ARG USER_GID=1001

RUN groupadd --gid $USER_GID $USERNAME && \
    useradd --uid $USER_UID --gid $USER_GID -m $USERNAME && \
    echo "$USERNAME ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

# Set working directory
WORKDIR /home/$USERNAME

# Ensure ownership
RUN chown -R $USERNAME:$USERNAME /home/$USERNAME

# Switch to the non-root user
USER $USERNAME

# Start bash on launch
CMD [ "bash" ]
