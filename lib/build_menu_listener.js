class BuildMenuListener {
    constructor(buildMenu, properties) {
        this.buildMenu = buildMenu;
        this.properties = properties;
        this.lastClickedPropertyId = undefined;
        this.listeners = [];

        this.buildMenu.addEventListener("click", this.onBuildMenuClick.bind(this));
        for (let property of properties) {
            property.element.addEventListener("click", (event) => {
                this.onPropertyClick(property.element.id, event);
            });
        }
    }

    onPropertyClick(propertyId, event) {
        this.lastClickedPropertyId = propertyId;
    }

    onMapUpdate(mapEntities) {
        this.properties = mapEntities.properties;
    }

    lookupProperty(propertyId) {
        for (let property of this.properties) {
            if (property.element.id === this.lastClickedPropertyId) {
                return property;
            }
        }
        throw "Couldn't find property for id: " + propertyId;
    }

    lastClickedProperty() {
        return this.lookupProperty(this.lastClickedPropertyId);
    }

    addUnitBuildListener(listener) {
        this.listeners.push(listener);
    }

    onBuildMenuClick(event) {
        let builtUnitName = event.path[0].innerText;
        let property = this.lastClickedProperty();

        for (let listener of this.listeners) {
            listener(property, builtUnitName);
        }
    }
}
