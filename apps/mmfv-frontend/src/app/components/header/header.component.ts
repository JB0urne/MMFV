import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './header.component.html',
    styleUrl: './header.component.css',
})
export class HeaderComponent {
    showSortierenMenu = false;

    toggleSortierenMenu() {
        this.showSortierenMenu = !this.showSortierenMenu;
    }

    selectSubmenuItem(item: string) {
        console.log('Selected submenu item:', item);
    }
}
