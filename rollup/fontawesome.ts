import {dom, library} from '@fortawesome/fontawesome-svg-core';
import {
    faArrowDown,
    faArrowUp,
    faArrowUpRightFromSquare,
    faClone,
    faCode,
    faCopy,
    faGears,
    faRetweet,
    faSquarePlus,
    faTrash,
    faWrench
} from '@fortawesome/free-solid-svg-icons';

library.add(faSquarePlus, faArrowUpRightFromSquare, faWrench, faRetweet, faCode, faTrash, faGears, faCopy, faArrowDown, faArrowUp, faClone);

window.addEventListener('DOMContentLoaded', () => {
    dom.i2svg();
    dom.watch();
});
