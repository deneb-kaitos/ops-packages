ARG DEBIAN_FRONTEND=noninteractive
ARG user_id=builder
ARG node_version
ARG nanos_package
ARG package_name
ARG nanos_package
ARG image_config
ARG npmrc
ARG pnpm_workspace
ARG image_name

ARG node_path=/usr/local/bin/nodejs

FROM debian:buster-slim AS os-base
SHELL ["/bin/bash", "-c"]
RUN apt-get --assume-yes --no-install-recommends --no-install-suggests update \
    && apt-get --assume-yes --no-install-recommends --no-install-suggests upgrade \
    && apt-get --assume-yes --no-install-recommends --no-install-suggests install \
      ca-certificates \
      curl \
      tree \
      xz-utils \
      qemu-system-x86 \
      sudo \
    && apt-get purge --assume-yes --autoremove \
    && apt-get clean --assume-yes \
    && rm -rf /var/lib/apt/lists/*

FROM os-base AS add-builder-user
ARG user_id
RUN useradd \
    --home-dir /home/$user_id \
    --create-home \
    --no-log-init \
    --shell /bin/bash \
    $user_id \
    && addgroup kvm \
    && usermod -aG kvm $user_id \
    && usermod -aG sudo $user_id \
    && echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers
USER $user_id

FROM add-builder-user AS install-ops
RUN curl https://ops.city/get.sh -sSfL | /bin/bash

FROM install-ops AS install-node
ARG node_version
ARG node_path
ARG user_id
ENV PATH=$node_path/bin:$PATH
RUN sudo mkdir -p $node_path \
    && sudo chown $user_id $node_path
RUN cd /tmp \
    && curl -O https://nodejs.org/dist/v$node_version/node-v$node_version-linux-x64.tar.xz \
    && tar -xf node-v$node_version-linux-x64.tar.xz --strip-components=1 -C $node_path \
    && rm -f node-v$node_version-linux-x64.tar.xz

FROM install-node AS install-pnpm
ARG node_path
ARG user_id
ENV PATH=$node_path/bin:$PATH
WORKDIR /home/$user_id/app
RUN curl -L https://unpkg.com/@pnpm/self-installer | node \
    && pnpm config set store-dir /home/$user_id/app/.pnpm-store \
    && pnpm set verify-store-integrity false

FROM install-pnpm AS prepare-to-build-project
ARG node_path
ARG user_id
ARG nanos_package
ARG node_version
ENV PATH=$node_path/bin:$PATH
WORKDIR /home/$user_id/app
ADD --chown=$user_id ./ ./
COPY --chown=$user_id $nanos_package /home/$user_id/.ops/local_packages/
RUN sudo chown -R $user_id:$user_id . \
    && tar -xzf ~/.ops/local_packages/node_v$node_version.tar.gz -C ~/.ops/local_packages/ \
    && rm -f ~/.ops/local_packages/node_v$node_version.tar.gz \
    && rm -f ./node_v$node_version.tar.gz

FROM prepare-to-build-project AS build-project
ARG user_id
ARG image_name
# WORKDIR /home/$user_id/app/project-sources
# RUN pnpm --recursive install \
#     && pnpm run build

FROM build-project AS build-nanos-image
ARG user_id
ARG image_name
ARG package_name
WORKDIR /home/$user_id/app
RUN /home/$user_id/.ops/bin/ops image create \
      --config ./image-config.json \
      --local \
      --package $package_name \
      --nightly \
      --imagename $image_name \
      --target-cloud onprem

