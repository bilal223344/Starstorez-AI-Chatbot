export { };

declare global {
    let shopify: {
        scopes: {
            request: (scopes: string[]) => Promise<{ result: 'granted-all' | 'declined-all' }>;
            query: () => Promise<unknown>;
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
                onSelectionChange?: (selectionType: unknown, toggleType: unknown, selection: unknown) => void;
                hasMoreItems?: boolean;
                promotedBulkActions?: { content: string; onAction: () => void }[];
                bulkActions?: { content: string; onAction: () => void }[];
                loading?: boolean;
            };
            's-thead': React.HTMLAttributes<HTMLElement>;
            's-tbody': React.HTMLAttributes<HTMLElement>;
            's-tr': React.HTMLAttributes<HTMLElement>;
            's-th': React.HTMLAttributes<HTMLElement>;
            's-td': React.HTMLAttributes<HTMLElement>;
            's-tag': React.HTMLAttributes<HTMLElement>;
            's-badge': React.HTMLAttributes<HTMLElement>;
            's-switch': Omit<React.HTMLAttributes<HTMLElement>, 'onChange'> & {
                label?: string;
                details?: string;
                checked?: boolean;
                onChange?: (event: { target: HTMLInputElement }) => void;
                disabled?: boolean;
            };
            's-number-field': Omit<React.HTMLAttributes<HTMLElement>, 'onInput' | 'onChange'> & {
                label?: string;
                value?: string | number;
                min?: number;
                max?: number;
                step?: number;
                onChange?: (event: { target: HTMLInputElement }) => void;
                disabled?: boolean;
            };
            's-color-field': Omit<React.HTMLAttributes<HTMLElement>, 'onInput' | 'onChange'> & {
                label?: string;
                placeholder?: string;
                value?: string;
                onChange?: (event: { target: HTMLInputElement }) => void;
                disabled?: boolean;
            };
            's-input': React.HTMLAttributes<HTMLElement>;
            's-select': Omit<React.HTMLAttributes<HTMLElement>, 'onInput' | 'onChange'> & {
                label?: string;
                name?: string;
                value?: string;
                onInput?: (event: { target: HTMLSelectElement }) => void;
                onChange?: (event: { target: HTMLSelectElement }) => void;
                disabled?: boolean;
                details?: string;
            };
            's-modal': React.HTMLAttributes<HTMLElement>;
            's-table-header-row': React.HTMLAttributes<HTMLElement>;
            's-table-header': React.HTMLAttributes<HTMLElement>;
            's-table-body': React.HTMLAttributes<HTMLElement>;
            's-table-row': React.HTMLAttributes<HTMLElement>;
            's-table-cell': React.HTMLAttributes<HTMLElement>;
            's-checkbox': React.HTMLAttributes<HTMLElement>;
            's-clickable': React.HTMLAttributes<HTMLElement> & {
                border?: string;
                borderRadius?: string;
                padding?: string;
                background?: string;
                inlineSize?: string;
                onClick?: () => void;
            };
            's-image': React.HTMLAttributes<HTMLElement> & {
                src?: string;
                alt?: string;
                width?: string | number;
                height?: string | number;
            };
            's-link': React.HTMLAttributes<HTMLElement> & {
                url?: string;
                external?: boolean;
            };
            's-text-field': Omit<React.HTMLAttributes<HTMLElement>, 'onInput' | 'onChange'> & {
                label?: string;
                name?: string;
                value?: string | number;
                placeholder?: string;
                maxLength?: number;
                onInput?: (event: { target: HTMLInputElement }) => void;
                onChange?: (event: { target: HTMLInputElement }) => void;
                disabled?: boolean;
                readOnly?: boolean;
                error?: string | boolean;
                helpText?: string;
                autoFocus?: boolean;
                type?: string;
            };
            's-text-area': Omit<React.HTMLAttributes<HTMLElement>, 'onInput' | 'onChange'> & {
                label?: string;
                name?: string;
                value?: string;
                placeholder?: string;
                maxLength?: number;
                onInput?: (event: { target: HTMLTextAreaElement }) => void;
                onChange?: (event: { target: HTMLTextAreaElement }) => void;
                disabled?: boolean;
                readOnly?: boolean;
                error?: string | boolean;
                helpText?: string;
                autoFocus?: boolean;
                rows?: number;
            };
            's-tooltip': React.HTMLAttributes<HTMLElement>;
            's-popover': React.HTMLAttributes<HTMLElement>;
            's-divider': React.HTMLAttributes<HTMLElement>;
            's-choice-list': React.HTMLAttributes<HTMLElement>;
            's-choice': React.HTMLAttributes<HTMLElement>;
        }
    }
}
