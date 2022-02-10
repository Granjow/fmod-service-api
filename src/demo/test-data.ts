import { IFmodBank } from '../api-generator/interfaces/fmod-interfaces';

/**
 * Test data to test special cases
 */
export const testBankData: IFmodBank[] = [ {
    bankName: 'Music',
    events: [ {
        name: 'Music/Level 01',
        params: [
            { name: 'ÜberStinger', type: 'continuous', min: 0, max: 1 },
            {
                name: 'Progression',
                type: 'labeled',
                labels: [ { value: 0, name: 'Intro' }, { value: 1, name: 'Main' } ]
            }
        ],
    }, {
        name: 'Music/ÜberLevel 02',
        params: [ {
            name: 'Progression',
            type: 'labeled',
            labels: [ { value: 0, name: 'Intro' }, { value: 1, name: 'Äxtra' } ]
        } ],
    } ],
}, {
    bankName: 'SFX',
    events: [ { name: 'UI/Cancel', params: [] } ]
} ];

/**
 * Handful of events from the FMOD-built-in sample project
 */
export const sampleProjectData: IFmodBank[] = [ {
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
        params: [
            { name: 'Area', type: 'continuous', min: 0, max: 80 } ],
    } ],
}, {
    bankName: 'SFX',
    events: [ { name: 'UI/Cancel', params: [] } ]
} ];
