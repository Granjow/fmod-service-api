import { FmodCodegen } from '../api-generator/fmod-codegen';
import path from 'path';
import { sampleProject, testBankProject } from './test-data';

new FmodCodegen( testBankProject, {
    projectDataType: {
        name: 'IExtendedFmodProject',
        importInstruction: 'import type { IExtendedFmodProject } from \'./test-data\';',
    },
} )
    .importFrom( '../index' )
    .generateTo( 'TestProject', path.join( __dirname, '../../../src/demo/generated-demo-code.ts' ) );

new FmodCodegen( sampleProject )
    .importFrom( '../index' )
    .generateTo( 'FmodSampleProject', path.join( __dirname, '../../../src/demo/fmod-sample-project.ts' ) );
