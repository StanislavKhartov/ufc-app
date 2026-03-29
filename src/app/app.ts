import { Component, computed, OnInit, signal } from '@angular/core';
import { DataService } from './services/data.service';
import { Fighter } from './models/fighter';
import { Match } from './models/match';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SecurityUtils } from './security/security';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  activeTab = signal<'fighters' | 'matches'>('fighters');
  fighters = signal<Fighter[]>([]);
  matches = signal<Match[]>([]);
  sortKey = signal<string>('');
  sortDir = signal<number>(1);
  selectedIds = signal<Set<string>>(new Set());

  isModalOpen = false;
  editingItem: any = {};

  constructor(private dataService: DataService) { }

  async ngOnInit() {
    await this.refresh();
  }

  async refresh() {
    this.fighters.set(await this.dataService.getFighters());
    this.matches.set(await this.dataService.getMatches());
  }

  sortedData = computed(() => {
    const tab = this.activeTab();
    const data = tab === 'fighters' ? [...this.fighters()] : [...this.matches()];
    const key = this.sortKey();
    const dir = this.sortDir();

    if (!key) return data;

    return data.sort((a: any, b: any) => {
      let valA = a;
      let valB = b;

      for (const k of key.split('.')) {
        valA = valA?.[k];
        valB = valB?.[k];
      }

      if (typeof valA === 'number' && typeof valB === 'number') return (valA - valB) * dir;

      if (key.toLowerCase().includes('date')) {
        return (new Date(valA).getTime() - new Date(valB).getTime()) * dir;
      }

      return (valA || '').toString().localeCompare((valB || '').toString()) * dir;
    });
  });

  setSort(key: string) {
    if (this.sortKey() === key) {
      this.sortDir.update(d => -d);
    } else {
      this.sortKey.set(key);
      this.sortDir.set(1);
    }
  }

  openModal(item: any = {}) {
    this.editingItem = { ...item };
    this.isModalOpen = true;
  }

  async save() {
    const table = this.activeTab();
    const cleanItem = SecurityUtils.sanitize(this.editingItem);

    const error = table === 'fighters'
      ? SecurityUtils.validateFighter(cleanItem)
      : SecurityUtils.validateMatch(cleanItem);

    if (error) {
      alert(error);
      return;
    }

    const { fighter1, fighter2, ...payload } = cleanItem;
    await this.dataService.save(table, payload);

    this.isModalOpen = false;
    await this.refresh();
  }

  async deleteItem(id: string | undefined) {
    if (!id) return;
    if (confirm('Are you sure you want to delete this?')) {
      await this.dataService.delete(this.activeTab(), id);
      await this.refresh();
    }
  }

  toggleSelection(id: string) {
    this.selectedIds.update(set => {
      const newSet = new Set(set);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  }
  toggleAll() {
    const currentData = this.sortedData();
    const allSelected = currentData.every(item => this.selectedIds().has(item.id));

    if (allSelected) {
      this.selectedIds.set(new Set());
    } else {
      this.selectedIds.set(new Set(currentData.map(item => item.id)));
    }
  }

  async deleteSelected() {
    const ids = Array.from(this.selectedIds());
    if (ids.length === 0) return;

    if (confirm(`Are you sure you want to delete ${ids.length} items?`)) {
      await this.dataService.deleteMultiple(this.activeTab(), ids);
      this.selectedIds.set(new Set()); // Очищаем выбор
      await this.refresh();
    }
  }

  resetSelection() {
    this.selectedIds.set(new Set());
  }


  asFighter(item: any): Fighter { return item as Fighter; }
  asMatch(item: any): Match { return item as Match; }
}