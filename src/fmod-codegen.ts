import * as fs from 'fs';
import { Bank, Event, LabeledParam, Param } from './fmod-types';
import camelcase from 'camelcase';

interface CodeNames {
    className: string;
    memberName: string;
}

interface ClassData {
    className: string;
    memberName: string;
    code: string;
}

export class FmodCodegen {
    private readonly _data: Bank[];
    private _importFrom = 'fmod-service-api';

    constructor( data: Bank[] ) {
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
        fs.writeFileSync( destPath, code );
    }

    generate( mainName: string ): string {

        const allData: ClassData[] = [];
        const eventData: ClassData[] = [];

        for ( const bank of this._data ) {

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
            .replaceAll( '\'../index\'', `'${this._importFrom}'` );
    }

    private generateMainCode( mainName: string, eventData: ClassData[] ): string {
        const names = FmodCodegen.generateClassNames( mainName );

        const s4 = this.createSpacer( 4 );
        const s8 = this.createSpacer( 8 );
        const s12 = this.createSpacer( 12 );
        const eventDefs = eventData
            .map( ( el, ix ) => `${s4( ix )}${el.memberName}: ${el.className};` )
            .join( '\n' );

        const eventInits = eventData
            .map( ( el, ix ) => `${s8( ix )}this.${el.memberName} = new ${el.className}();` );

        const eventList = eventData
            .map( ( el, ix ) => `${s12( ix )}this.${el.memberName},` );

        return this.loadTemplate( 'main', names )
            .replace( '// EVENT_DEF', eventDefs )
            .replace( '// EVENT_LIST', eventList.join( '\n' ) )
            .replace( '// CONSTRUCTOR', eventInits.join( '\n' ) );
    }

    private generateEventCode( event: Event, bank: Bank, paramData: ClassData[] ): ClassData {
        const names = FmodCodegen.generateClassNames( event.name );

        const s4 = this.createSpacer( 4 );
        const s8 = this.createSpacer( 8 );
        const s12 = this.createSpacer( 12 );
        const paramDefs = paramData
            .map( ( el, ix ) => `${s4( ix )}${el.memberName}: ${el.className};` )
            .join( '\n' );
        const constructor = paramData
            .map( ( el, ix ) => `${s8( ix )}this.${el.memberName} = new ${el.className}();` )
            .join( '\n' );

        const paramList = paramData
            .map( ( el, ix ) => `${s12( ix )}this.${el.memberName},` )
            .join( '\n' );

        const useOrDefault = ( text: string, defaultValue: string ): string => text.length > 0 ? text : defaultValue;

        const code = this.loadTemplate( 'event', names )
            .replace( 'EVENT_NAME', `${event.name}` )
            .replace( 'BANK_NAME', `${bank.bankName}` )
            .replace( '// PARAM_LIST', useOrDefault( paramList, '// No Parameters' ) )
            .replace( '// PARAM_DEF', useOrDefault( paramDefs, '// No definitions' ) )
            .replace( '// CONSTRUCTOR', useOrDefault( constructor, '// Nothing to construct' ) );

        return {
            code,
            className: names.className,
            memberName: names.memberName,
        };
    }


    private generateParamCode( param: Param, event: Event ): ClassData {
        const names = FmodCodegen.generateClassNames( param.name );

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
            className: names.className,
            memberName: names.memberName,
        };
    }

    private static generateClassNames( name: string ): CodeNames {
        const dashedName = name
            .replaceAll( /[^a-zA-Z0-9]/g, '_' )
            .replace( /^[^a-zA-Z]/, 'xx' );

        const memberName = camelcase( dashedName, { pascalCase: false } );
        const className = camelcase( dashedName, { pascalCase: true } );

        return {
            className,
            memberName,
        };
    }

    private loadTemplate( name: string, names?: CodeNames ): string {
        const rawTemplate = fs.readFileSync( __dirname + `/../../src/templates/${name}.template.ts`, { encoding: 'utf-8' } );
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

    private createSpacer( length: number ): ( n: number ) => string {
        return ( ix: number ): string => ix > 0 ? new Array( length ).fill( ' ' ).join( '' ) : '';
    }

}
