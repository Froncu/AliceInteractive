import { defineComponent } from 'vue';

import BaseTool from '../BaseTool/BaseToolScript';

export default defineComponent({
    name: 'ShapeTool',
    extends: { BaseTool },
    setup() {
        function activate() {
            console.log(2);
        }

        return { activate };
    }
})