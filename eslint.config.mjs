import henderea from 'eslint-config-henderea';

export default [
  ...henderea,
  {
    ignores: ['.vscode', '.vercel', '.idea', 'build', 'dist', 'public']
  }
];
