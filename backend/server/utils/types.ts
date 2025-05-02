export interface IFolder {
  id: string;
  name: string;
  children?: IFolder[];
  documents?: IDocument[];
}

export interface IDocument {
  id: string;
  name: string;
}
