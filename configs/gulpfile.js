
import gulp from 'gulp';
import * as child_process from 'child_process';

const _runAsyncCmd = (command) => {
  return new Promise((resolve, reject) => {

    const child = child_process.spawn(command, {shell: true});
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`exit on code ${code}`));
      } else {
        resolve({ code });
      }
    });
    child.on('error', (err) => reject(err));
    // child.stdout?.on('data', (data) => console.log(`stdout: ${data}`));
    // child.stderr?.on('data', (data) => console.log(`stderr: ${data}`));
  });
}

gulp.task('bundle', async () => {
  await _runAsyncCmd("npm run bunjs-build-debug", {shell: true});
});
gulp.task('copy-page', async () => {
  await _runAsyncCmd("npm run copy-page", {shell: true});
});
gulp.task('copy-css', async () => {
  await _runAsyncCmd("npm run copy-css", {shell: true});
});

gulp.task('default',
  gulp.parallel(
    'bundle',
    'copy-page',
    'copy-css',
  )
);

// npx gulp --gulpfile ./configs/gulpfile.js