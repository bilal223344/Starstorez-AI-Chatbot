export { };

declare global {
    var shopify: {
        scopes: {
            request: (scopes: string[]) => Promise<{ result: 'granted-all' | 'declined-all' }>;
            query: () => Promise<any>;
        };
        toast: {
            show: (message: string) => void;
        };
    };

    namespace JSX {
        interface IntrinsicElements {
            's-page': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
                title?: string;
                subtitle?: string;
                backAction?: () => void;
                primaryAction?: { content: string; onAction: () => void; disabled?: boolean; loading?: boolean };
                secondaryActions?: { content: string; onAction: () => void; disabled?: boolean; loading?: boolean }[];
                fullWidth?: boolean;
                narrowWidth?: boolean;
                inlineSize?: "large";
            };
            's-section': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
                title?: string;
                padding?: "none";
            };
            's-stack': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
                direction?: "inline" | "block";
                gap?: "none" | "extra-tight" | "tight" | "base" | "loose" | "extra-loose" | "large" | string;
                alignItems?: "start" | "center" | "end" | "baseline" | "stretch";
                justifyContent?: "start" | "center" | "end" | "space-between" | "space-around" | "space-evenly";
                wrap?: boolean;
                fullWidth?: boolean;
                padding?: "last" | "base" | "none" | "large";
                background?: "subdued" | "base";
                border?: "base" | "large";
                borderStyle?: "dashed";
                borderRadius?: "base";
                borderColor?: "strong";
                borderWidth?: "base none none none" | "none base none base" | "none" | string;
            };
            's-box': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
                borderRadius?: "base";
                background?: "subdued";
                overflow?: "hidden";
                inlineSize?: string;
                blockSize?: string;
            };
            's-heading': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
                element?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
            };
            's-text': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
                as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
                variant?: "headingHg" | "headingLg" | "headingMd" | "headingSm" | "headingXs" | "bodyLg" | "bodyMd" | "bodySm" | "bodyXs";
                fontWeight?: "regular" | "medium" | "semibold" | "bold";
                alignment?: "start" | "center" | "end" | "justify";
                color?: "text" | "subdued" | "success" | "critical" | "warning" | "highlight";
                breakWord?: boolean;
                truncate?: boolean;
            };
            's-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
                variant?: "primary" | "secondary" | "plain";
                size?: "large" | "medium" | "small" | "micro";
                textAlign?: "start" | "center" | "end";
                fullWidth?: boolean;
                icon?: string | any;
                disabled?: boolean;
                loading?: boolean;
                submit?: boolean;
                url?: string;
                external?: boolean;
                active?: boolean;
                onClick?: React.MouseEventHandler<HTMLElement>;
                role?: string;
                pressed?: boolean;
            };
            's-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
                source: any;
                color?: "base" | "subdued" | "critical" | "warning" | "highlight" | "success" | "primary";
                backdrop?: boolean;
            };
            's-grid': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
                gap?: string;
                columns?: number | { sm?: number; md?: number; lg?: number; xl?: number };
                areas?: object;
                gridTemplateColumns?: string;
                border?: string;
                borderWidth?: string;
                paddingBlockStart?: string;
                slot?: string;
                borderColor?: string;
                justifyContent?: string;
                alignItems?: string;
            };
            's-card': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
                title?: string;
                sectioned?: boolean;
                primaryFooterAction?: { content: string; onAction: () => void; disabled?: boolean; loading?: boolean };
                secondaryFooterActions?: { content: string; onAction: () => void; disabled?: boolean; loading?: boolean }[];
                footerActionAlignment?: "left" | "right";
                subdued?: boolean;
            };
            's-table': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
                headings?: string[];
                resourceName?: { singular: string; plural: string };
                itemCount?: number;
                selectedItemsCount?: number | "all";
                onSelectionChange?: (selectionType: any, toggleType: any, selection: any) => void;
                hasMoreItems?: boolean;
                promotedBulkActions?: { content: string; onAction: () => void }[];
                bulkActions?: { content: string; onAction: () => void }[];
                loading?: boolean;
            };
            's-thead': any;
            's-tbody': any;
            's-tr': any;
            's-th': any;
            's-td': any;
            's-tag': any;
            's-badge': any;
            's-switch': any;
            's-input': any;
            's-select': any;
            's-modal': any;
            's-table-header-row': any;
            's-table-header': any;
            's-table-body': any;
            's-table-row': any;
            's-table-cell': any;
            's-checkbox': any;
            's-clickable': any;
            's-image': any;
            's-link': any;
            's-text-field': any;
            's-tooltip': any;
            's-popover': any;
            's-divider': any;
            's-choice-list': any;
            's-choice': any;
        }
    }
}
