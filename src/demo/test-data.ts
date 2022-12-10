import { IFmodBank, IFmodProject } from '../api-generator/interfaces/fmod-interfaces';
import { FmodEventType } from '../api-generator/interfaces/fmod-event-type';

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
    localised: true,
    events: [ { name: 'UI/Cancel', params: [] } ]
} ];

/**
 * Only used for unit testing the code generator
 */
export interface IExtendedFmodProject extends IFmodProject {
    testProperty: string;
}

export const testBankProject: IExtendedFmodProject = {
    banks: testBankData,
    localisation: {
        languages: [ 'en', 'de' ],
        defaultLanguage: 'de',
    },
    testProperty: 'foo',
};

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
        name: 'Pause',
        eventType: FmodEventType.snapshot,
        params: [],
    }, {
        name: 'Music/Level 02',
        params: [
            { name: 'Area', type: 'continuous', min: 0, max: 80 } ],
    } ],
}, {
    bankName: 'SFX',
    events: [
        { name: 'UI/Cancel', params: [] },
        { name: 'Character/Dialogue', params: [], requiresOtherBanks: [ 'Dialogue' ] },
    ]
}, {
    bankName: 'Dialogue',
    localised: true,
    events: [],
} ];

export const sampleProject: IFmodProject = {
    banks: sampleProjectData,
    localisation: {
        languages: [ 'EN', 'JP', 'CN' ],
        defaultLanguage: 'EN',
    },
    globalParameters: [ {
        name: 'Test',
        type: 'continuous',
        defaultValue: 0,
    } ],
};
