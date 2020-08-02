import './index.scss';
import $ from 'jquery';
//import 'jquery-ui';
//import _ from 'lodash';
//import rand from 'lodash/rand';

// @ts-ignore
import registerServiceWorker from '@henderea/static-site-builder/registerServiceWorker';

if(process.env.NODE_ENV === 'production') {
  registerServiceWorker();
}