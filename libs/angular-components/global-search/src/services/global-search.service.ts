import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';

declare var require: any;

const elasticlunr = require('elasticlunr');

export interface Result {
  doc: Object;
  ref: string;
  score: number;
}

export interface ResultGroup {
  key: string;
  value: Partial<Result>[];
  selected?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class GlobalSearchService {
  private index: any;
  itemClicked = new ReplaySubject<Object>(1);

  initIndex(fields?: string[], ref?: string) {
    return new Promise((resolve, reject) => {
      if (!this.index) {
        this.index = elasticlunr(function(this: any) {
          if (fields && fields.length) {
            fields.forEach(field => {
              this.addField(field);
            });
          }
          this.setRef(ref || 'id');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  addFields(fields?: string[]) {
    if (this.index && fields && fields.length) {
      fields.forEach(field => {
        this.index.addField(field);
      });
    }
  }

  addDoc(doc: any) {
    if (this.index) {
      this.index.addDoc(doc);
    }
  }

  updateDoc(doc: any) {
    if (this.index) {
      this.index.updateDoc(doc);
    }
  }

  removeDoc(doc: any) {
    if (this.index) {
      this.index.removeDoc(doc);
    }
  }

  search(query: string): Array<{ doc: any }> {
    if (this.index) {
      const fields = this.index.getFields().reduce((acc: any, item: any) => {
        acc[item] = { boost: 1 };
        return acc;
      }, {});
      return this.index.search(query, {
        fields,
        bool: 'AND',
        expand: true
      });
    }
    return [];
  }

  onItemClick(item: Object) {
    this.itemClicked.next(item);
  }

  constructor() {}
}
