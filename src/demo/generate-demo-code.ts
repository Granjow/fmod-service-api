import { FmodCodegen } from '../api-generator/fmod-codegen';
import path from 'path';
import { sampleProjectData, testBankData } from './test-data';

new FmodCodegen( testBankData )
    .importFrom( '../index' )
    .generateTo( 'TestProject', path.join( __dirname, '../../../src/demo/generated-demo-code.ts' ) );

new FmodCodegen( sampleProjectData )
    .importFrom( '../index' )
    .generateTo( 'FmodSampleProject', path.join( __dirname, '../../../src/demo/fmod-sample-project.ts' ) );
