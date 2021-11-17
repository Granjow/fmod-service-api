import { FmodCodegen } from './fmod-codegen';
import path from 'path';

const codegen = new FmodCodegen( [ {
    bankName: 'Music',
    events: [ {
        name: 'Music/Level 01',
        params: [
            { name: 'Stinger', type: 'continuous', min: 0, max: 1 },
            {
                name: 'Progression',
                type: 'labeled',
                labels: [ { value: 0, name: 'Intro' }, { value: 1, name: 'Main' } ]
            }
        ],
    }, {
        name: 'Music/Level 02',
        params: [],
    } ],
}, {
    bankName: 'SFX',
    events: [ { name: 'UI/Cancel', params: [] } ]
} ] );

codegen.generateTo( 'FmodExample', path.join( __dirname, '../../src/generated-demo-code.ts' ) );
