import {dom, library} from '@fortawesome/fontawesome-svg-core';
import {faCode, faCopy, faGears, faRetweet, faSquarePlus, faTrash} from '@fortawesome/free-solid-svg-icons';

library.add(faSquarePlus, faRetweet, faCode, faTrash, faGears, faCopy);

window.addEventListener('DOMContentLoaded', () => {
    dom.i2svg();
    dom.watch();
});
