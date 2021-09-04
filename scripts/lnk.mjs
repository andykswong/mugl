import lnk from 'lnk';

lnk(['src/common'], 'assembly', { force: true, type: 'symbolic' })
  .then(
    () => console.log('Created symlink from assembly/common to src/common'),
    (e) => console.warn('Failed to create symlink: ' + e)  
  );
