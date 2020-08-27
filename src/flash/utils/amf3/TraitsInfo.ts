export default class TraitsInfo {

    private className: string;
    private dynamic: boolean;
    private externalizable: boolean;
    private properties: string[];

    constructor(className: string, dynamic: boolean, externalizable: boolean, properties: string[] = []) {
        this.className = className;
        this.dynamic = dynamic;
        this.externalizable = externalizable;
        this.properties = properties;
    }

    public isDynamic(): boolean {
        return this.dynamic;
    }

    public isExternalizable(): boolean {
        return this.externalizable;
    }

    public length(): number {
        return this.properties.length;
    }

    public getClassName(): string {
        return this.className;
    }

    public addProperty(name: string): void {
        this.properties.push(name);
    }

    public getProperty(i: number): string {
        return this.properties[i];
    }

    public getProperties(): string[] {
        return this.properties;
    }
}