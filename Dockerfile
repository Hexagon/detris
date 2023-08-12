# Adjust this line to the deno version of your choice
FROM denoland/deno:debian-1.34.1

# This copies all files in the current working directory to /app in the
# docker image. 
RUN mkdir /app
COPY . /app/

# Install pup - Pin this url to a specific version in production
RUN ["deno","install","--unstable","-Afrn","pup", "https://deno.land/x/pup/pup.ts"]

# Go!
ENTRYPOINT ["sh", "-c", "cd /app && pup run"]