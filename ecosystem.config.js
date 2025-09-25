module.exports = {
  apps: [
    {
      name: 'm-lenz',
      script: 'yarn start:prod',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
