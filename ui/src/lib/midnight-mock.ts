// Mock implementation of Midnight SDK for UI development

export class Field {
  private value: string;

  constructor(value: string | number) {
    this.value = value.toString();
  }

  static fromString(value: string): Field {
    return new Field(value);
  }

  static fromNumber(value: number): Field {
    return new Field(value);
  }

  toString(): string {
    return this.value;
  }
}

export class MidnightWallet {
  private connected = false;

  async connect(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.connected = true;
  }

  disconnect(): void {
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }
}

export class AnonymousVotingContract {
  private compiled = false;

  async compile(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    this.compiled = true;
  }

  isCompiled(): boolean {
    return this.compiled;
  }
}