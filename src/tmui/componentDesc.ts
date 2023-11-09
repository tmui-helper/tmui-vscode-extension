interface PropsTbale {
    name: string;
    type: string;
    default: string | number;
    desc: string;
};

interface Props {
    desc: string;
    table: PropsTbale[];
};

interface EventsTable {
    name: string;
    data: string;
    cb: string;
    desc: string;
};

interface Events {
    desc: string;
    table: EventsTable[];
};

interface SlotsTable {
    name: string;
    data: string;
    type: string;
    desc: string;
};

interface Slots {
    desc: string;
    table: SlotsTable[];
};

interface RefsTable {
    name: string;
    data: string;
    cb: string;
    desc: string;
};

interface Refs {
    desc: string;
    table: RefsTable[];
};

export interface ComponentDesc {
    name: string;
    title: string;
    desc: string;
    props: Props;
    events: Events;
    slots: Slots;
    refs: Refs;
};