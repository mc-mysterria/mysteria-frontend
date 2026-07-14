import {describe, expect, it} from 'vitest';
import {decodeBalanceReport} from '../normalize';

// Shapes below are verbatim from a real /balance/report response.
describe('decodeBalanceReport', () => {
    it('rebuilds objects, lists, strings, booleans, and double-wrapped numbers', () => {
        const tree = {
            members: {
                meta: {members: {pluginVersion: {value: '1.4.4'}}},
                schemaVersion: {value: {value: '2'}},
                sequenceTables: {
                    members: {
                        damageMultiplier: {
                            elements: [{value: {value: '28.0'}}, {value: {value: '1.25'}}],
                        },
                    },
                },
                abilities: {
                    elements: [{
                        members: {
                            id: {value: 'abyss-9-0'},
                            sequence: {value: {value: '9'}},
                            cooldownSeconds: {value: {value: '-1'}},
                            activated: {value: true},
                            categoryCooldowns: {members: {}},
                            damageKeys: {members: {'criminal-proficiency': {value: {value: '4.0'}}}},
                            damageProfiles: {
                                members: {
                                    'criminal-proficiency': {
                                        members: {
                                            trigger: {value: 'ON_HIT'},
                                            procChance: {value: {value: '1.0'}},
                                            aoe: {value: false},
                                            notes: {value: 'Weapon proficiency bonus damage.'},
                                        },
                                    },
                                },
                            },
                        },
                    }],
                },
                bypassSites: {elements: [{value: 'SomeListener.java:42'}]},
            },
        };
        expect(decodeBalanceReport(tree)).toEqual({
            meta: {pluginVersion: '1.4.4'},
            schemaVersion: 2,
            sequenceTables: {damageMultiplier: [28, 1.25]},
            abilities: [{
                id: 'abyss-9-0',
                sequence: 9,
                cooldownSeconds: -1,
                activated: true,
                categoryCooldowns: {},
                damageKeys: {'criminal-proficiency': 4},
                damageProfiles: {
                    'criminal-proficiency': {
                        trigger: 'ON_HIT', procChance: 1, aoe: false,
                        notes: 'Weapon proficiency bonus damage.',
                    },
                },
            }],
            bypassSites: ['SomeListener.java:42'],
        });
    });

    it('keeps a double-wrapped non-numeric string as a string', () => {
        expect(decodeBalanceReport({members: {odd: {value: {value: 'not-a-number'}}}}))
            .toEqual({odd: 'not-a-number'});
    });

    it('passes an already-plain payload through untouched', () => {
        const plain = {meta: {pluginVersion: '1.0'}, abilities: [{id: 'sun-9-0'}]};
        expect(decodeBalanceReport(plain)).toBe(plain);
        expect(decodeBalanceReport(null)).toBeNull();
        expect(decodeBalanceReport({})).toEqual({});
    });
});
