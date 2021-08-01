import lnk from 'lnk';

lnk(['src/common'], 'assembly', { force: true, type: 'symbolic' })
    .then(() => console.log('Created synlink from assembly/common to src/common'));
