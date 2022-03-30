import * as fs from 'fs';
import { CodeNames, NamingTools } from './naming-tools';
import { IFmodBank, IFmodEvent, IFmodParam, IFmodProject, LabeledParam } from './interfaces/fmod-interfaces';

interface ClassData {
    className: string;
    memberName: string;
    originalName: string;
    code: string;
}

export class FmodCodegen {
    private readonly _data: IFmodProject;
    private _importFrom = '@geheimgang188/fmod-service-api';

    constructor( data: IFmodProject ) {
        this._data = data;
    }

    /**
     * Overrides the default import location.
     * @param path Defaults to the module name.
     */
    importFrom( path: string ): FmodCodegen {
        this._importFrom = path;
        return this;
    }

    generateTo( mainName: string, destPath: string ): void {
        const code = this.generate( mainName );
        console.log( `Writing generated API to ${destPath}` );
        fs.writeFileSync( destPath, code );
    }

    generate( mainName: string ): string {

        const allData: ClassData[] = [];
        const eventData: ClassData[] = [];

        for ( const bank of this._data.banks ) {

            for ( const event of bank.events ) {
                const paramData: ClassData[] = [];
                for ( const param of event.params ) {
                    paramData.push( this.generateParamCode( param, event ) );
                }
                const eventCode = this.generateEventCode( event, bank, paramData );
                eventData.push( eventCode );

                allData.push( ...paramData );
                allData.push( eventCode );
            }
        }

        const mainClass = this.generateMainCode( mainName, eventData );

        const codeElements = [
            this.generateIncludes(),
            mainClass,
        ];
        codeElements.push( ...allData.map( el => el.code ) );

        return codeElements.join( '\n\n' );
    }

    private generateIncludes(): string {
        return this.loadTemplate( 'includes' )
            .replaceAll( '\'../../index\'', `'${this._importFrom}'` )
            .replaceAll( '\'../../api/i-logger\'', `'${this._importFrom}'` );
    }

    private generateMainCode( mainName: string, eventData: ClassData[] ): string {
        const names = NamingTools.generateClassNames( mainName );

        const s4 = this.createSpacer( 4 );
        const s8 = this.createSpacer( 8 );
        const s12 = this.createSpacer( 12 );

        const eventDefinitions: string[] = [];
        const eventInitialisation: string[] = [];
        const eventRegistration: string[] = [];

        eventData.forEach( ( event, ix ) => {
            eventDefinitions.push( `${s4( ix )}${event.memberName}: ${event.className};` );
            eventInitialisation.push( `${s8( ix )}this.${event.memberName} = new ${event.className}();` );
            eventRegistration.push( `${s8( 1 )}this.registerEvent( this.${event.memberName} );` );

            if ( event.memberName !== event.originalName ) {
                eventDefinitions.push( `${s4( 1 )}'${event.originalName}': ${event.className};` );
                eventInitialisation.push( `${s8( 1 )}this['${event.originalName}'] = this.${event.memberName};` );
            }
        } );

        const eventList = eventData
            .map( ( el, ix ) => `${s12( ix )}this.${el.memberName},` );

        let localise = '// (no localised banks)';
        if ( this._data.localisation !== undefined ) {

            const localisedBanks = this._data.banks
                .filter( el => el.localised )
                .map( el => `'${el.bankName}'` )
                .join( ', ' );
            const languages = this._data.localisation.languages
                .map( el => `'${el}'` )
                .join( ', ' );

            localise = `this.configureLocalisation( [ ${localisedBanks} ], [ ${languages} ], '${this._data.localisation.defaultLanguage}' );`;
        }

        const constructor = eventInitialisation
            .concat( eventRegistration )
            .join( '\n' );

        return this.loadTemplate( 'main', names )
            .replace( '// EVENT_DEF', eventDefinitions.join( '\n' ) )
            .replace( '// EVENT_LIST', eventList.join( '\n' ) )
            .replace( '// LOCALISE', localise )
            .replace( '// CONSTRUCTOR', constructor );
    }

    private generateEventCode( event: IFmodEvent, bank: IFmodBank, paramData: ClassData[] ): ClassData {
        const names = NamingTools.generateClassNames( event.name );

        const s4 = this.createSpacer( 4 );
        const s8 = this.createSpacer( 8 );
        const s12 = this.createSpacer( 12 );

        const parameterDefinitions: string[] = [];
        const parameterInitialisation: string[] = [];
        const parameterList: string[] = [];

        paramData.forEach( ( el, ix ) => {
            parameterDefinitions.push( `${s4( ix )}${el.memberName}: ${el.className};` );
            parameterInitialisation.push( `${s8( ix )}this.${el.memberName} = new ${el.className}();` );
            parameterList.push( `${s12( ix )}this.${el.memberName},` );

            if ( el.memberName !== el.originalName ) {
                parameterDefinitions.push( `${s4( 1 )}'${el.originalName}': ${el.className};` );
                parameterInitialisation.push( `${s8( 1 )}this['${el.originalName}'] = this.${el.memberName};` );
            }
        } );

        const useOrDefault = ( text: string, defaultValue: string ): string => text.length > 0 ? text : defaultValue;

        const code = this.loadTemplate( 'event', names )
            .replace( 'EVENT_NAME', `${event.name}` )
            .replace( 'BANK_NAME', `${bank.bankName}` )
            .replace( '\'ADDITIONAL_BANKS\'', `${event.requiresOtherBanks?.map( el => `'${el}'` ).join( ', ' ) ?? ''}` )
            .replace( '// PARAM_LIST', useOrDefault( parameterList.join( '\n' ), '// No Parameters' ) )
            .replace( '// PARAM_DEF', useOrDefault( parameterDefinitions.join( '\n' ), '// No definitions' ) )
            .replace( '// CONSTRUCTOR', useOrDefault( parameterInitialisation.join( '\n' ), '// Nothing to construct' ) );

        return {
            code,
            originalName: event.name,
            className: names.className,
            memberName: names.memberName,
        };
    }


    private generateParamCode( param: IFmodParam, event: IFmodEvent ): ClassData {
        const names = NamingTools.generateClassNames( param.name, event.name );

        let templateName: string;
        switch ( param.type ) {
            case 'continuous':
                templateName = 'param-continuous';
                break;
            case 'labeled':
                templateName = 'param-labeled';
                break;
            default:
                throw new Error( `Unhandled type: ${param.type}` );
        }

        let code = this.loadTemplate( templateName, names )
            .replaceAll( 'PARAM_NAME', param.name )
            .replaceAll( 'EVENT_ID', `event:/${event.name}` );

        const s4 = this.createSpacer( 4 );
        if ( param.type === 'labeled' ) {
            const labeledParam = param as LabeledParam;
            const labels = labeledParam.labels
                .map( ( el, ix ) => `${s4( ix )}'${el.name}': ${el.value},` )
                .join( '\n' );
            code = code.replace( '// LABELS', labels );
        }

        return {
            code,
            originalName: param.name,
            className: names.className,
            memberName: names.memberName,
        };
    }

    private loadTemplate( name: string, names?: CodeNames ): string {
        const rawTemplate = fs.readFileSync( __dirname + `/../../../src/api-generator/templates/${name}.template.ts`, { encoding: 'utf-8' } );
        const lines = rawTemplate.split( '\n' );

        let include = false;
        let data = lines.filter( ( line ) => {
            if ( !include ) {
                if ( line === '// begin-template' ) {
                    include = true;
                }
                return false;
            } else {
                if ( line === '// end-template' ) {
                    include = false;
                    return false;
                }
                return true;
            }
        } ).join( '\n' );

        if ( names !== undefined ) {
            data = data.replaceAll( 'CLASSNAME', names.className );
        }
        return data;
    }

    /**
     * Creates a spacer function for the given indent. The spacer function takes one argument;
     * if it is > 0, the indent is not added, otherwise it is.
     *
     * This is used for replacing in templates where the search string is usually already indented,
     * so only the following lines need indentation.
     */
    private createSpacer( length: number ): ( n: number ) => string {
        return ( ix: number ): string => ix > 0 ? new Array( length ).fill( ' ' ).join( '' ) : '';
    }

}
