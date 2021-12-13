SRCS = manifest.json background/* content_scripts/* lib/* options/* res/* vendor/*

OUTPUT_DIR = dist/
OUTPUT = $(OUTPUT_DIR)/package.zip

.PHONY: default clean new

default: $(OUTPUT)

clean:
	rm -r $(OUTPUT_DIR)

new: clean default

$(OUTPUT): $(SRCS)
	mkdir -p $(OUTPUT_DIR)
	zip -r $(OUTPUT) $(SRCS)
