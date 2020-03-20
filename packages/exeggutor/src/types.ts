export type DockerJobEntity = {
  registry: {
    imageName: string;
    endpoint: string;
    tag: string;
  };
  run: {
    expose: number;
  };
};
