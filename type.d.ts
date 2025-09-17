type DateValue = string | number | null;
type Dynamic = any;
type DynamicObject = Record<string, any>;

type ApiResultEmpty = DynamicObject;

type AsyncVoidFunction = () => Promise<void>;

type PageMode = 'create' | 'edit' | 'view';

type Nullable<T> = { [P in keyof T]: T[P] | null };

type IndexProps = {
  index: number;
}