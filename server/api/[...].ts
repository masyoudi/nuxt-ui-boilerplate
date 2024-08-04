import { createRouter, useBase, defineEventHandler } from 'h3';

import login from '@@/server/controllers/login';
import logout from '@@/server/controllers/logout';
import forms from '@@/server/controllers/forms';

const router = createRouter();

router.post('/login', defineEventHandler(login.post));
router.get('/logout', defineEventHandler(logout.clear));

router.post('/forms/json', defineEventHandler(forms.json));
router.post('/forms/form-data', defineEventHandler(forms.formData));

export default useBase('/api', router.handler);
