# Use denoland's Deno Docker image
FROM denoland/deno:1.33.4

# The port that your application listens to.
EXPOSE 8080

# Set the working directory in the Docker image
WORKDIR /app

# Add the rest of the source code files
ADD . .

# Compile the main application so that it doesn't need to be compiled each startup/entry
RUN deno cache main.ts

# Run your application
CMD ["run", "--allow-read", "--allow-write", "--allow-net", "--allow-env", "--unstable", "main.ts"]