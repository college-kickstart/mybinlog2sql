# Executing: mysqlbinlog --verbose /var/lib/mysql/bb8d6b813472-bin.000008
# The proper term is pseudo_replica_mode, but we use this compatibility alias
# to make the statement usable on server versions 8.0.24 and older.
/*!50530 SET @@SESSION.PSEUDO_SLAVE_MODE=1*/;
/*!50003 SET @OLD_COMPLETION_TYPE=@@COMPLETION_TYPE,COMPLETION_TYPE=0*/;
DELIMITER /*!*/;
# at 4
#250207 15:39:21 server id 1  end_log_pos 126 CRC32 0x9e49cb24 	Start: binlog v 4, server v 8.0.41 created 250207 15:39:21
BINLOG '
GRumZw8BAAAAegAAAH4AAAAAAAQAOC4wLjQxAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAEwANAAgAAAAABAAEAAAAYgAEGggAAAAICAgCAAAACgoKKioAEjQA
CigAASTLSZ4=
'/*!*/;
# at 126
#250207 15:39:21 server id 1  end_log_pos 157 CRC32 0x752b8ca1 	Previous-GTIDs
# [empty]
# at 157
#250207 15:39:21 server id 1  end_log_pos 236 CRC32 0x0f4c2977 	Anonymous_GTID	last_committed=0	sequence_number=1	rbr_only=no	original_committed_timestamp=1738939161233903	immediate_commit_timestamp=1738939161233903	transaction_length=273
# original_commit_timestamp=1738939161233903 (2025-02-07 15:39:21.233903 CET)
# immediate_commit_timestamp=1738939161233903 (2025-02-07 15:39:21.233903 CET)
/*!80001 SET @@session.original_commit_timestamp=1738939161233903*//*!*/;
/*!80014 SET @@session.original_server_version=80041*//*!*/;
/*!80014 SET @@session.immediate_server_version=80041*//*!*/;
SET @@SESSION.GTID_NEXT= 'ANONYMOUS'/*!*/;
# at 236
#250207 15:39:21 server id 1  end_log_pos 430 CRC32 0xef346a07 	Query	thread_id=14	exec_time=0	error_code=0	Xid = 35
use `test`/*!*/;
SET TIMESTAMP=1738939161/*!*/;
SET @@session.pseudo_thread_id=14/*!*/;
SET @@session.foreign_key_checks=1, @@session.sql_auto_is_null=0, @@session.unique_checks=1, @@session.autocommit=1/*!*/;
SET @@session.sql_mode=35651584/*!*/;
SET @@session.auto_increment_increment=1, @@session.auto_increment_offset=1/*!*/;
/*!\C latin1 *//*!*/;
SET @@session.character_set_client=8,@@session.collation_connection=8,@@session.collation_server=255/*!*/;
SET @@session.lc_time_names=0/*!*/;
SET @@session.collation_database=DEFAULT/*!*/;
/*!80011 SET @@session.default_collation_for_utf8mb4=255*//*!*/;
/*!80013 SET @@session.sql_require_primary_key=0*//*!*/;
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_name VARCHAR(50)
)
/*!*/;
# at 430
#250207 15:39:21 server id 1  end_log_pos 509 CRC32 0x75420000 	Anonymous_GTID	last_committed=1	sequence_number=2	rbr_only=yes	original_committed_timestamp=1738939161243950	immediate_commit_timestamp=1738939161243950	transaction_length=326
/*!50718 SET TRANSACTION ISOLATION LEVEL READ COMMITTED*//*!*/;
# original_commit_timestamp=1738939161243950 (2025-02-07 15:39:21.243950 CET)
# immediate_commit_timestamp=1738939161243950 (2025-02-07 15:39:21.243950 CET)
/*!80001 SET @@session.original_commit_timestamp=1738939161243950*//*!*/;
/*!80014 SET @@session.original_server_version=80041*//*!*/;
/*!80014 SET @@session.immediate_server_version=80041*//*!*/;
SET @@SESSION.GTID_NEXT= 'ANONYMOUS'/*!*/;
# at 509
#250207 15:39:21 server id 1  end_log_pos 584 CRC32 0xbff83527 	Query	thread_id=14	exec_time=0	error_code=0
SET TIMESTAMP=1738939161/*!*/;
BEGIN
/*!*/;
# at 584
#250207 15:39:21 server id 1  end_log_pos 648 CRC32 0x9fd192d6 	Table_map: `test`.`categories` mapped to number 94
# has_generated_invisible_primary_key=0
# at 648
#250207 15:39:21 server id 1  end_log_pos 725 CRC32 0x8f4a2df1 	Write_rows: table id 94 flags: STMT_END_F

BINLOG '
GRumZxMBAAAAQAAAAIgCAAAAAF4AAAAAAAEABHRlc3QACmNhdGVnb3JpZXMAAgMPAsgAAgEBAAID
/P8A1pLRnw==
GRumZx4BAAAATQAAANUCAAAAAF4AAAAAAAEAAgAC/wABAAAAC0VsZWN0cm9uaWNzAAIAAAAFQm9v
a3MAAwAAAAhDbG90aGluZ/EtSo8=
'/*!*/;
### INSERT INTO `test`.`categories`
### SET
###   @1=1
###   @2='Electronics'
### INSERT INTO `test`.`categories`
### SET
###   @1=2
###   @2='Books'
### INSERT INTO `test`.`categories`
### SET
###   @1=3
###   @2='Clothing'
# at 725
#250207 15:39:21 server id 1  end_log_pos 756 CRC32 0xd9b79fc7 	Xid = 36
COMMIT/*!*/;
# at 756
#250207 15:39:21 server id 1  end_log_pos 833 CRC32 0x52162e7c 	Anonymous_GTID	last_committed=2	sequence_number=3	rbr_only=no	original_committed_timestamp=1738939161262892	immediate_commit_timestamp=1738939161262892	transaction_length=220
# original_commit_timestamp=1738939161262892 (2025-02-07 15:39:21.262892 CET)
# immediate_commit_timestamp=1738939161262892 (2025-02-07 15:39:21.262892 CET)
/*!80001 SET @@session.original_commit_timestamp=1738939161262892*//*!*/;
/*!80014 SET @@session.original_server_version=80041*//*!*/;
/*!80014 SET @@session.immediate_server_version=80041*//*!*/;
SET @@SESSION.GTID_NEXT= 'ANONYMOUS'/*!*/;
# at 833
#250207 15:39:21 server id 1  end_log_pos 976 CRC32 0xf9ae28bc 	Query	thread_id=14	exec_time=0	error_code=0	Xid = 38
SET TIMESTAMP=1738939161/*!*/;
/*!80013 SET @@session.sql_require_primary_key=0*//*!*/;
ALTER TABLE users CHANGE username user_name VARCHAR(50)
/*!*/;
# at 976
#250207 15:39:21 server id 1  end_log_pos 1053 CRC32 0xae718886 	Anonymous_GTID	last_committed=3	sequence_number=4	rbr_only=no	original_committed_timestamp=1738939161359084	immediate_commit_timestamp=1738939161359084	transaction_length=204
# original_commit_timestamp=1738939161359084 (2025-02-07 15:39:21.359084 CET)
# immediate_commit_timestamp=1738939161359084 (2025-02-07 15:39:21.359084 CET)
/*!80001 SET @@session.original_commit_timestamp=1738939161359084*//*!*/;
/*!80014 SET @@session.original_server_version=80041*//*!*/;
/*!80014 SET @@session.immediate_server_version=80041*//*!*/;
SET @@SESSION.GTID_NEXT= 'ANONYMOUS'/*!*/;
# at 1053
#250207 15:39:21 server id 1  end_log_pos 1180 CRC32 0x7b4c711d 	Query	thread_id=14	exec_time=0	error_code=0	Xid = 40
SET TIMESTAMP=1738939161/*!*/;
/*!80013 SET @@session.sql_require_primary_key=0*//*!*/;
ALTER TABLE products MODIFY price FLOAT
/*!*/;
# at 1180
#250207 15:39:21 server id 1  end_log_pos 1257 CRC32 0x9e3bdc02 	Anonymous_GTID	last_committed=4	sequence_number=5	rbr_only=no	original_committed_timestamp=1738939161391872	immediate_commit_timestamp=1738939161391872	transaction_length=241
# original_commit_timestamp=1738939161391872 (2025-02-07 15:39:21.391872 CET)
# immediate_commit_timestamp=1738939161391872 (2025-02-07 15:39:21.391872 CET)
/*!80001 SET @@session.original_commit_timestamp=1738939161391872*//*!*/;
/*!80014 SET @@session.original_server_version=80041*//*!*/;
/*!80014 SET @@session.immediate_server_version=80041*//*!*/;
SET @@SESSION.GTID_NEXT= 'ANONYMOUS'/*!*/;
# at 1257
#250207 15:39:21 server id 1  end_log_pos 1421 CRC32 0x0d8ac28d 	Query	thread_id=14	exec_time=0	error_code=0	Xid = 42
SET TIMESTAMP=1738939161/*!*/;
SET @@session.time_zone='SYSTEM'/*!*/;
/*!80013 SET @@session.sql_require_primary_key=0*//*!*/;
ALTER TABLE orders ADD order_date DATETIME DEFAULT CURRENT_TIMESTAMP
/*!*/;
# at 1421
#250207 15:39:21 server id 1  end_log_pos 1500 CRC32 0x279be16c 	Anonymous_GTID	last_committed=5	sequence_number=6	rbr_only=yes	original_committed_timestamp=1738939161406968	immediate_commit_timestamp=1738939161406968	transaction_length=342
/*!50718 SET TRANSACTION ISOLATION LEVEL READ COMMITTED*//*!*/;
# original_commit_timestamp=1738939161406968 (2025-02-07 15:39:21.406968 CET)
# immediate_commit_timestamp=1738939161406968 (2025-02-07 15:39:21.406968 CET)
/*!80001 SET @@session.original_commit_timestamp=1738939161406968*//*!*/;
/*!80014 SET @@session.original_server_version=80041*//*!*/;
/*!80014 SET @@session.immediate_server_version=80041*//*!*/;
SET @@SESSION.GTID_NEXT= 'ANONYMOUS'/*!*/;
# at 1500
#250207 15:39:21 server id 1  end_log_pos 1575 CRC32 0x215b4fa1 	Query	thread_id=14	exec_time=0	error_code=0
SET TIMESTAMP=1738939161/*!*/;
BEGIN
/*!*/;
# at 1575
#250207 15:39:21 server id 1  end_log_pos 1637 CRC32 0x70120223 	Table_map: `test`.`users` mapped to number 95
# has_generated_invisible_primary_key=0
# at 1637
#250207 15:39:21 server id 1  end_log_pos 1732 CRC32 0xe854484e 	Write_rows: table id 95 flags: STMT_END_F

BINLOG '
GRumZxMBAAAAPgAAAGUGAAAAAF8AAAAAAAEABHRlc3QABXVzZXJzAAMDDw8EyACQAQYBAQACA/z/
ACMCEnA=
GRumZx4BAAAAXwAAAMQGAAAAAF8AAAAAAAEAAgAD/wAGAAAABWZyYW5rEQBmcmFua0BleGFtcGxl
LmNvbQAHAAAABWdyYWNlEQBncmFjZUBleGFtcGxlLmNvbU5IVOg=
'/*!*/;
### INSERT INTO `test`.`users`
### SET
###   @1=6
###   @2='frank'
###   @3='frank@example.com'
### INSERT INTO `test`.`users`
### SET
###   @1=7
###   @2='grace'
###   @3='grace@example.com'
# at 1732
#250207 15:39:21 server id 1  end_log_pos 1763 CRC32 0xc9947848 	Xid = 44
COMMIT/*!*/;
# at 1763
#250207 15:39:21 server id 1  end_log_pos 1842 CRC32 0xa030183c 	Anonymous_GTID	last_committed=6	sequence_number=7	rbr_only=yes	original_committed_timestamp=1738939161414447	immediate_commit_timestamp=1738939161414447	transaction_length=300
/*!50718 SET TRANSACTION ISOLATION LEVEL READ COMMITTED*//*!*/;
# original_commit_timestamp=1738939161414447 (2025-02-07 15:39:21.414447 CET)
# immediate_commit_timestamp=1738939161414447 (2025-02-07 15:39:21.414447 CET)
/*!80001 SET @@session.original_commit_timestamp=1738939161414447*//*!*/;
/*!80014 SET @@session.original_server_version=80041*//*!*/;
/*!80014 SET @@session.immediate_server_version=80041*//*!*/;
SET @@SESSION.GTID_NEXT= 'ANONYMOUS'/*!*/;
# at 1842
#250207 15:39:21 server id 1  end_log_pos 1917 CRC32 0xe6a8ac97 	Query	thread_id=14	exec_time=0	error_code=0
SET TIMESTAMP=1738939161/*!*/;
BEGIN
/*!*/;
# at 1917
#250207 15:39:21 server id 1  end_log_pos 1981 CRC32 0x0bba9b32 	Table_map: `test`.`products` mapped to number 96
# has_generated_invisible_primary_key=0
# at 1981
#250207 15:39:21 server id 1  end_log_pos 2032 CRC32 0xf6737f84 	Delete_rows: table id 96 flags: STMT_END_F

BINLOG '
GRumZxMBAAAAQAAAAL0HAAAAAGAAAAAAAAEABHRlc3QACHByb2R1Y3RzAAMDDwQDyAAEBgEBAAID
/P8AMpu6Cw==
GRumZyABAAAAMwAAAPAHAAAAAGAAAAAAAAEAAgAD/wAEAAAABkRvb2RhZArXZ0GEf3P2
'/*!*/;
### DELETE FROM `test`.`products`
### WHERE
###   @1=4
###   @2='Doodad'
###   @3=14.49               
# at 2032
#250207 15:39:21 server id 1  end_log_pos 2063 CRC32 0x540c8263 	Xid = 46
COMMIT/*!*/;
# at 2063
#250207 15:39:21 server id 1  end_log_pos 2142 CRC32 0x17a5f828 	Anonymous_GTID	last_committed=7	sequence_number=8	rbr_only=yes	original_committed_timestamp=1738939161419535	immediate_commit_timestamp=1738939161419535	transaction_length=322
/*!50718 SET TRANSACTION ISOLATION LEVEL READ COMMITTED*//*!*/;
# original_commit_timestamp=1738939161419535 (2025-02-07 15:39:21.419535 CET)
# immediate_commit_timestamp=1738939161419535 (2025-02-07 15:39:21.419535 CET)
/*!80001 SET @@session.original_commit_timestamp=1738939161419535*//*!*/;
/*!80014 SET @@session.original_server_version=80041*//*!*/;
/*!80014 SET @@session.immediate_server_version=80041*//*!*/;
SET @@SESSION.GTID_NEXT= 'ANONYMOUS'/*!*/;
# at 2142
#250207 15:39:21 server id 1  end_log_pos 2226 CRC32 0xa016a0e1 	Query	thread_id=14	exec_time=0	error_code=0
SET TIMESTAMP=1738939161/*!*/;
BEGIN
/*!*/;
# at 2226
#250207 15:39:21 server id 1  end_log_pos 2282 CRC32 0x6a41a4b3 	Table_map: `test`.`orders` mapped to number 97
# has_generated_invisible_primary_key=0
# at 2282
#250207 15:39:21 server id 1  end_log_pos 2354 CRC32 0x757cf11f 	Update_rows: table id 97 flags: STMT_END_F

BINLOG '
GRumZxMBAAAAOAAAAOoIAAAAAGEAAAAAAAEABHRlc3QABm9yZGVycwAEAwMDEgEADgEBALOkQWo=
GRumZx8BAAAASAAAADIJAAAAAGEAAAAAAAEAAgAE//8AAwAAAAMAAAABAAAAmbXO+dUAAwAAAAMA
AAACAAAAmbXO+dUf8Xx1
'/*!*/;
### UPDATE `test`.`orders`
### WHERE
###   @1=3
###   @2=3
###   @3=1
###   @4='2025-02-07 15:39:21'
### SET
###   @1=3
###   @2=3
###   @3=2
###   @4='2025-02-07 15:39:21'
# at 2354
#250207 15:39:21 server id 1  end_log_pos 2385 CRC32 0x0c3be6e2 	Xid = 48
COMMIT/*!*/;
# at 2385
#250207 15:39:21 server id 1  end_log_pos 2439 CRC32 0x72630201 	Rotate to bb8d6b813472-bin.000009  pos: 4
SET @@SESSION.GTID_NEXT= 'AUTOMATIC' /* added by mysqlbinlog */ /*!*/;
DELIMITER ;
# End of log file
/*!50003 SET COMPLETION_TYPE=@OLD_COMPLETION_TYPE*/;
/*!50530 SET @@SESSION.PSEUDO_SLAVE_MODE=0*/;
