interface Event {
    name: string;
    once?: boolean
    execute(...args: any[]): void | Promise<void>;
}

export default Event;