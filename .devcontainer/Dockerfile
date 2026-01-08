FROM oven/bun:slim

# Add OS-level dependencies here as needed.
RUN apt-get update \
	&& apt-get install -y --no-install-recommends \
		build-essential \
		ca-certificates \
		git \
	&& apt-get clean \
	&& rm -rf /var/lib/apt/lists/*
