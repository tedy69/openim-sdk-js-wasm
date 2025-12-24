import { Database } from '@jlongster/sql.js';

export function alterTable(db: Database) {
  alter351(db);
  alter380(db);
  alter381(db);
  alterAddSenderFaceBackgroundColor(db);
}

function alter351(db: Database) {
  try {
    db.exec(
      `
        ALTER TABLE local_friends ADD COLUMN is_pinned numeric;
        `
    );
  } catch (error) {
    // alter table error
  }
}

function alter380(db: Database) {
  try {
    db.exec(
      `
        ALTER TABLE local_groups ADD COLUMN display_is_read numeric;
        `
    );
  } catch (error) {
    // alter table error
  }
}

function alter381(db: Database) {
  try {
    db.exec(
      `
        ALTER TABLE local_app_sdk_version ADD COLUMN installed numeric;
        `
    );
  }
}


function alterAddSenderFaceBackgroundColor(db: Database) {
  try {
    // Get all chat_logs tables
    const tables = db.exec(
      `SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'chat_logs_%';`
    );
    
    if (tables.length > 0 && tables[0].values) {
      tables[0].values.forEach((row: any) => {
        const tableName = row[0];
        try {
          db.exec(
            `ALTER TABLE '${tableName}' ADD COLUMN sender_face_background_color varchar(255);`
          );
        } catch (e) {
          // Column might already exist
        }
      });
    }
    
    // Also update temp_cache_local_chat_logs if it exists
    try {
      db.exec(
        `ALTER TABLE temp_cache_local_chat_logs ADD COLUMN sender_face_background_color varchar(255);`
      );
    } catch (e) {
      // Column might already exist
    }
    
    // Add face_background_color to local_conversations table
    try {
      db.exec(
        `ALTER TABLE local_conversations ADD COLUMN face_background_color varchar(255);`
      );
    } catch (e) {
      // Column might already exist
    }
  } catch (error) {
    // alter table error
  }
}
